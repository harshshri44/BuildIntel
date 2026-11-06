"""
BuildIntel - MahaRERA Real-Estate Project Data Scraper
Scrapes publicly listed projects from MahaRERA search portal into PostgreSQL.
Supports district filtering, post-scrape pincode filtering, pagination,
idempotent upsert or new-records-only modes, and real-time progress reporting.
"""

import argparse
import datetime
import json
import logging
import re
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

# Ensure local imports work regardless of CWD
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from database import SessionLocal, engine, Base
from models import Builder, Project, ScrapingJob

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout
)
logger = logging.getLogger("maharera_scraper")

# Verified MahaRERA District Name to Code mapping
MAHARASHTRA_DISTRICTS = {
    "Ahmednagar": "522",
    "Akola": "501",
    "Amravati": "503",
    "Aurangabad": "515",
    "Beed": "523",
    "Bhandara": "506",
    "Buldana": "500",
    "Chandrapur": "509",
    "Dharashiv": "992",
    "Dhule": "498",
    "Gadchiroli": "508",
    "Gondiya": "507",
    "Hingoli": "512",
    "Jalgaon": "499",
    "Jalna": "514",
    "Kolhapur": "530",
    "Latur": "524",
    "Mumbai City": "519",
    "Mumbai Suburban": "518",
    "Nagpur": "505",
    "Nanded": "511",
    "Nandurbar": "497",
    "Nashik": "516",
    "Osmanabad": "525",
    "Palghar": "990",
    "Parbhani": "513",
    "Pune": "521",
    "Raigarh": "520",
    "Ratnagiri": "528",
    "Sangli": "531",
    "Satara": "527",
    "Sindhudurg": "529",
    "Solapur": "526",
    "Thane": "517",
    "Wardha": "504",
    "Washim": "502",
    "Yavatmal": "510",
}


def resolve_district_code(district_input: Optional[str]) -> Optional[str]:
    """Resolves a district name or numeric string to verified MahaRERA district code."""
    if not district_input:
        return None
    cleaned = str(district_input).strip()
    if not cleaned or cleaned.lower() in ("all", "0", "any", "none"):
        return None

    # Already numeric code - verify it is a valid MahaRERA district code
    if cleaned.isdigit():
        if cleaned in MAHARASHTRA_DISTRICTS.values():
            return cleaned
        return None

    # Case-insensitive lookup in mapping
    cleaned_lower = cleaned.lower()
    for name, code in MAHARASHTRA_DISTRICTS.items():
        if name.lower() == cleaned_lower:
            return code

    # Partial match fallback e.g. "Mumbai" -> "Mumbai City"
    for name, code in MAHARASHTRA_DISTRICTS.items():
        if cleaned_lower in name.lower():
            return code

    return None


def resolve_district_name(code_input: Optional[str]) -> Optional[str]:
    """Resolves a numeric code or string to canonical MahaRERA district name."""
    if not code_input:
        return None
    cleaned = str(code_input).strip()
    if not cleaned or cleaned.lower() in ("all", "0", "any", "none"):
        return None

    for name, code in MAHARASHTRA_DISTRICTS.items():
        if code == cleaned:
            return name

    return None


class MahaRERAScraper:
    BASE_URL = "https://www.maharera.maharashtra.gov.in/projects-search-result"

    DEFAULT_HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.maharera.maharashtra.gov.in/",
    }

    def __init__(
        self,
        delay_seconds: float = 1.5,
        timeout_seconds: int = 25,
        verify_ssl: bool = True,
        district_code: Optional[str] = None,
        district_name: Optional[str] = None,
        pincode: Optional[str] = None,
        mode: str = "upsert",
        max_records: int = 0,
        job_id: Optional[str] = None,
    ):
        self.delay_seconds = delay_seconds
        self.timeout_seconds = timeout_seconds
        self.verify_ssl = verify_ssl
        self.district_code = district_code or resolve_district_code(district_name)
        self.district_name = district_name or resolve_district_name(self.district_code)
        self.pincode = pincode.strip() if pincode else None
        self.mode = mode if mode in ("upsert", "new_only") else "upsert"
        self.max_records = max_records
        self.job_id = job_id

        self.session = requests.Session()
        self.session.headers.update(self.DEFAULT_HEADERS)
        self.session_initialized = False

    def _ensure_session(self):
        """Initializes Drupal session cookies if not already established."""
        if not self.session_initialized:
            try:
                logger.debug("Initializing session with MahaRERA portal...")
                self.session.get(self.BASE_URL, timeout=self.timeout_seconds, verify=self.verify_ssl)
                self.session_initialized = True
            except requests.exceptions.SSLError as ssl_err:
                logger.error("SSL Certificate Verification failed: %s", ssl_err)
                raise
            except Exception as e:
                logger.warning("Session initialization notice: %s", e)

    def parse_date(self, date_str: Optional[str]) -> Optional[datetime.date]:
        """Safely parses common date formats or returns None."""
        if not date_str:
            return None
        cleaned = date_str.strip()
        if not cleaned or cleaned.upper() in ("N/A", "NA", "-", "NONE", "NULL"):
            return None

        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                return datetime.datetime.strptime(cleaned, fmt).date()
            except ValueError:
                continue

        logger.debug("Unrecognized date format: '%s'", date_str)
        return None

    def fetch_page_html(self, page_number: int, max_retries: int = 4) -> Optional[str]:
        """Fetches the HTML content for a specific page with retry logic."""
        params = {
            "project_type": "0",    # 0 = Registered Projects (MahaRERA requirement)
            "project_state": "27",  # 27 = Maharashtra
            "page": str(page_number),
        }

        # Apply server-side district filter if configured
        if self.district_code and str(self.district_code).strip() not in ("", "0", "None"):
            params["project_district"] = str(self.district_code).strip()

        for attempt in range(1, max_retries + 1):
            try:
                resp = self.session.get(
                    self.BASE_URL,
                    params=params,
                    timeout=self.timeout_seconds,
                    verify=self.verify_ssl
                )

                if resp.status_code == 200:
                    if "row shadow p-3 mb-5 bg-body rounded" in resp.text:
                        return resp.text

                    # If page 1 has no cards, portal might truly have no records for this filter
                    if "No Record Found" in resp.text or "No Results" in resp.text or "No record found" in resp.text:
                        return resp.text

                    logger.warning(
                        "Page %d attempt %d received response without cards. Clearing cookies and retrying...",
                        page_number, attempt
                    )
                    self.session.cookies.clear()
                else:
                    logger.warning(
                        "Page %d attempt %d failed with HTTP %d. Retrying...",
                        page_number, attempt, resp.status_code
                    )

            except requests.exceptions.SSLError as ssl_err:
                logger.error("SSL Verification error on page %d: %s", page_number, ssl_err)
                raise ssl_err

            except requests.exceptions.RequestException as req_err:
                logger.warning(
                    "Page %d attempt %d encountered network error: %s",
                    page_number, attempt, req_err
                )

            if attempt < max_retries:
                time.sleep(1.5 * attempt)

        logger.error("Exceeded max retries (%d) for page %d.", max_retries, page_number)
        return None

    def extract_total_pages(self, html_content: str) -> Optional[int]:
        """Discovers total available pages from MahaRERA pagination widget."""
        try:
            soup = BeautifulSoup(html_content, "html.parser")
            span_count = soup.find("span", class_="pagesCount")
            if span_count and span_count.has_attr("data-current-data"):
                return int(span_count["data-current-data"])

            # Fallback regex search for 'of \d+'
            match = re.search(r"of\s+(\d+)", html_content)
            if match:
                return int(match.group(1))
        except Exception as e:
            logger.debug("Could not determine total pages: %s", e)
        return None

    def parse_project_cards(self, html_content: str) -> List[Dict]:
        """Parses project cards from the page HTML using known MahaRERA selectors."""
        soup = BeautifulSoup(html_content, "html.parser")
        card_elements = soup.find_all("div", class_="row shadow p-3 mb-5 bg-body rounded")
        parsed_records = []

        for card in card_elements:
            try:
                # 1. Registration Number
                reg_el = card.find("p", class_="p-0")
                raw_reg = reg_el.get_text(strip=True) if reg_el else ""
                reg_number = raw_reg.replace("#", "").strip()

                if not reg_number:
                    continue

                # 2. Project Name
                name_el = card.find("h4", class_="title4")
                project_name = name_el.get_text(strip=True) if name_el else "Unnamed Project"

                # 3. Builder / Promoter Name
                builder_el = card.find("p", class_=lambda c: c and "darkBlue" in c and "bold" in c)
                builder_name = builder_el.get_text(strip=True) if builder_el else "Unknown Builder"

                # 4. Locality
                loc_el = card.find("em", class_="fa-location-dot")
                locality = loc_el.parent.get_text(strip=True) if loc_el and loc_el.parent else None

                # 5. Metadata Grid (State, District, Pincode, Last Modified)
                meta = {}
                for block in card.find_all("div", class_="col-xl-4"):
                    label_el = block.find("div", class_="greyColor")
                    val_el = block.find("p")
                    if label_el and val_el:
                        meta[label_el.get_text(strip=True)] = val_el.get_text(strip=True)

                state = meta.get("State")
                district = meta.get("District")
                pincode = meta.get("Pincode")

                # Post-scrape Pincode Filter (MahaRERA server does not filter by pincode)
                if self.pincode:
                    clean_pin = pincode.strip() if pincode else ""
                    if clean_pin != self.pincode:
                        logger.debug("Skipping project %s due to pincode mismatch (%s != %s)", reg_number, clean_pin, self.pincode)
                        continue

                last_mod_str = meta.get("Last Modified")
                last_modified_date = self.parse_date(last_mod_str)

                # 6. Action URLs
                details_url = None
                orig_app_url = None
                for a in card.find_all("a", href=True):
                    txt = a.get_text(strip=True).lower()
                    if "original" in txt:
                        orig_app_url = a["href"]
                    elif "details" in txt:
                        details_url = a["href"]

                parsed_records.append({
                    "registration_number": reg_number,
                    "project_name": project_name,
                    "builder_name": builder_name,
                    "state": state,
                    "district": district,
                    "pincode": pincode,
                    "locality": locality,
                    "last_modified_date": last_modified_date,
                    "details_url": details_url,
                    "original_application_url": orig_app_url,
                    "source_name": "MahaRERA",
                })
            except Exception as card_err:
                logger.error("Error parsing individual card: %s", card_err)
                continue

        return parsed_records

    def save_to_database(self, db: Session, records: List[Dict]) -> Tuple[int, int, int, int]:
        """
        Persists scraped records into PostgreSQL with idempotent upsert or new-only logic.
        Returns: (inserted_count, updated_count, skipped_count, failed_count)
        """
        inserted = 0
        updated = 0
        skipped = 0
        failed = 0

        for item in records:
            try:
                # 1. Resolve or create Builder
                builder_name = item["builder_name"].strip()
                builder = db.query(Builder).filter(Builder.builder_name == builder_name).first()
                if not builder:
                    builder = Builder(builder_name=builder_name)
                    db.add(builder)
                    db.flush()

                # 2. Check if Project already exists
                reg_no = item["registration_number"].strip()
                project = db.query(Project).filter(Project.registration_number == reg_no).first()

                if project:
                    if self.mode == "new_only":
                        # In new_only mode, skip existing projects immediately
                        skipped += 1
                        continue

                    # Idempotent update: update attributes if changed
                    has_changes = (
                        project.project_name != item["project_name"] or
                        project.builder_id != builder.id or
                        project.state != item["state"] or
                        project.district != item["district"] or
                        project.pincode != item["pincode"] or
                        project.locality != item["locality"] or
                        project.last_modified_date != item["last_modified_date"] or
                        project.details_url != item["details_url"] or
                        project.original_application_url != item["original_application_url"]
                    )

                    if has_changes:
                        project.project_name = item["project_name"]
                        project.builder_id = builder.id
                        project.state = item["state"]
                        project.district = item["district"]
                        project.pincode = item["pincode"]
                        project.locality = item["locality"]
                        project.last_modified_date = item["last_modified_date"]
                        project.details_url = item["details_url"]
                        project.original_application_url = item["original_application_url"]
                        project.scraped_at = datetime.datetime.now(datetime.timezone.utc)
                        updated += 1
                    else:
                        skipped += 1
                else:
                    # New record insert
                    project = Project(
                        registration_number=reg_no,
                        project_name=item["project_name"],
                        builder_id=builder.id,
                        state=item["state"],
                        district=item["district"],
                        pincode=item["pincode"],
                        locality=item["locality"],
                        last_modified_date=item["last_modified_date"],
                        details_url=item["details_url"],
                        original_application_url=item["original_application_url"],
                        source_name="MahaRERA",
                        scraped_at=datetime.datetime.now(datetime.timezone.utc)
                    )
                    db.add(project)
                    inserted += 1

                db.commit()

            except Exception as e:
                db.rollback()
                logger.error("Failed to persist record '%s': %s", item.get("registration_number"), e)
                failed += 1

        return inserted, updated, skipped, failed

    def _emit_progress(
        self,
        event: str,
        pages_processed: int,
        total_pages: int,
        summary: Dict[str, int],
        message: str,
        db: Optional[Session] = None
    ):
        """Emits structured progress JSON to stdout and updates database row if job_id set."""
        payload = {
            "event": event,
            "job_id": self.job_id,
            "pages_processed": pages_processed,
            "total_pages": total_pages,
            "records_discovered": summary["fetched"],
            "records_inserted": summary["inserted"],
            "records_updated": summary["updated"],
            "records_skipped": summary["skipped"],
            "records_failed": summary["failed"],
            "message": message,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        # Print for stdout stream reader in Spring Boot
        print(f"PROGRESS_JSON:{json.dumps(payload)}", flush=True)

        # Update database row if job_id is provided
        if self.job_id and db:
            try:
                job = db.query(ScrapingJob).filter(ScrapingJob.id == self.job_id).first()
                if job:
                    job.pages_processed = pages_processed
                    job.total_pages = total_pages
                    job.records_discovered = summary["fetched"]
                    job.records_inserted = summary["inserted"]
                    job.records_updated = summary["updated"]
                    job.records_skipped = summary["skipped"]
                    job.records_failed = summary["failed"]
                    job.status = "RUNNING"
                    db.commit()
            except Exception as db_err:
                logger.warning("Failed to update ScrapingJob entity in DB: %s", db_err)
                db.rollback()

    def run(self, start_page: int = 1, end_page: int = 1, scrape_all: bool = False) -> Dict[str, int]:
        """Orchestrates scraping across pages and reports real-time statistics."""
        summary = {
            "fetched": 0,
            "inserted": 0,
            "updated": 0,
            "skipped": 0,
            "failed": 0
        }

        logger.info(
            "Starting MahaRERA scraper: pages [%d - %s], district=%s (%s), pincode=%s, mode=%s, max_records=%d",
            start_page,
            "ALL" if scrape_all else str(end_page),
            self.district_name or "All",
            self.district_code or "None",
            self.pincode or "None",
            self.mode,
            self.max_records
        )

        with SessionLocal() as db:
            # 1. Update job to RUNNING if job_id present
            if self.job_id:
                job = db.query(ScrapingJob).filter(ScrapingJob.id == self.job_id).first()
                if job:
                    job.status = "RUNNING"
                    job.start_time = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()

            current_page = start_page
            total_target_pages = end_page
            discovered_total_pages = None
            pages_completed = 0

            # Safety cap for scrape_all to avoid runaway jobs
            MAX_ALL_PAGES_LIMIT = 500

            while True:
                # Page limit check
                if not scrape_all and current_page > end_page:
                    break
                if scrape_all and pages_completed >= MAX_ALL_PAGES_LIMIT:
                    logger.info("Reached safety limit of %d pages for scrape_all", MAX_ALL_PAGES_LIMIT)
                    break

                logger.info("Fetching Page %d...", current_page)
                html = self.fetch_page_html(current_page)

                if not html:
                    logger.error("Could not retrieve HTML for page %d", current_page)
                    summary["failed"] += 1
                    pages_completed += 1
                    self._emit_progress(
                        "page_error",
                        pages_completed,
                        total_target_pages,
                        summary,
                        f"Page {current_page} fetch failed (network or timeout)",
                        db
                    )
                    current_page += 1
                    continue

                # Inspect total pages on first fetched page
                if discovered_total_pages is None:
                    discovered_total_pages = self.extract_total_pages(html)
                    if discovered_total_pages:
                        logger.info("MahaRERA reports %d total pages for query", discovered_total_pages)
                        if scrape_all:
                            total_target_pages = min(discovered_total_pages, MAX_ALL_PAGES_LIMIT)
                        else:
                            total_target_pages = end_page

                cards = self.parse_project_cards(html)
                summary["fetched"] += len(cards)
                logger.info("Parsed %d project cards on Page %d", len(cards), current_page)

                if not cards:
                    # If empty page reached, stop iteration
                    logger.info("No project cards found on Page %d. Halting pagination.", current_page)
                    pages_completed += 1
                    self._emit_progress(
                        "page_completed",
                        pages_completed,
                        total_target_pages,
                        summary,
                        f"Page {current_page} returned 0 cards (end of listings)",
                        db
                    )
                    break

                # Save cards to PostgreSQL
                ins, upd, skp, fld = self.save_to_database(db, cards)
                summary["inserted"] += ins
                summary["updated"] += upd
                summary["skipped"] += skp
                summary["failed"] += fld

                pages_completed += 1
                msg = f"Page {current_page} processed: +{ins} new, ~{upd} updated, ={skp} skipped, !{fld} failed"
                logger.info(msg)

                self._emit_progress(
                    "page_completed",
                    pages_completed,
                    total_target_pages,
                    summary,
                    msg,
                    db
                )

                # Check max records condition
                if self.max_records > 0 and (summary["inserted"] + summary["updated"]) >= self.max_records:
                    logger.info("Reached maximum record target of %d records. Stopping.", self.max_records)
                    break

                current_page += 1

                # Polite delay between requests
                time.sleep(self.delay_seconds)

            # Final job completion update
            if self.job_id:
                job = db.query(ScrapingJob).filter(ScrapingJob.id == self.job_id).first()
                if job:
                    job.status = "COMPLETED"
                    job.pages_processed = pages_completed
                    job.total_pages = total_target_pages
                    job.records_discovered = summary["fetched"]
                    job.records_inserted = summary["inserted"]
                    job.records_updated = summary["updated"]
                    job.records_skipped = summary["skipped"]
                    job.records_failed = summary["failed"]
                    job.end_time = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()

        self._print_summary(summary, start_page, current_page - 1)
        return summary

    def _print_summary(self, summary: Dict[str, int], start_page: int, end_page: int):
        print("\n" + "=" * 50)
        print(f" BuildIntel - MahaRERA Ingestion Summary (Pages {start_page} to {end_page})")
        print("=" * 50)
        print(f" Fetched Records : {summary['fetched']}")
        print(f" Inserted (New)  : {summary['inserted']}")
        print(f" Updated         : {summary['updated']}")
        print(f" Skipped         : {summary['skipped']}")
        print(f" Failed          : {summary['failed']}")
        print("=" * 50 + "\n", flush=True)


def main():
    parser = argparse.ArgumentParser(description="MahaRERA Project Listing Scraper")
    parser.add_argument("--page", type=int, help="Single page to scrape")
    parser.add_argument("--start-page", type=int, default=1, help="Starting page number (default: 1)")
    parser.add_argument("--end-page", type=int, default=1, help="Ending page number (default: 1)")
    parser.add_argument("--max-pages", type=int, default=None, help="Maximum number of pages to scrape")
    parser.add_argument("--all-pages", action="store_true", help="Scrape all available pages for query")
    parser.add_argument("--district", type=str, default=None, help="Target district name (e.g. Pune, Nagpur)")
    parser.add_argument("--district-code", type=str, default=None, help="Target district code (e.g. 521 for Pune)")
    parser.add_argument("--pincode", type=str, default=None, help="Post-scrape filter by 6-digit Pincode")
    parser.add_argument("--mode", type=str, default="upsert", choices=["upsert", "new_only"], help="Scraping mode")
    parser.add_argument("--max-records", type=int, default=0, help="Stop after inserting/updating N records")
    parser.add_argument("--job-id", type=str, default=None, help="BuildIntel Scraping Job UUID")
    parser.add_argument("--delay", type=float, default=1.5, help="Polite delay between requests in seconds (default: 1.5)")
    parser.add_argument("--timeout", type=int, default=25, help="HTTP request timeout in seconds (default: 25)")
    parser.add_argument("--recreate-tables", action="store_true", help="Drop and recreate database tables")

    args = parser.parse_args()

    if args.recreate_tables:
        logger.warning("Recreating database tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        logger.info("Tables recreated successfully.")

    start = args.page if args.page else args.start_page
    if args.page:
        end = args.page
    elif args.max_pages:
        end = start + args.max_pages - 1
    else:
        end = args.end_page

    if not args.all_pages and start > end:
        logger.error("Start page (%d) cannot be greater than end page (%d)", start, end)
        sys.exit(1)

    scraper = MahaRERAScraper(
        delay_seconds=args.delay,
        timeout_seconds=args.timeout,
        district_code=args.district_code,
        district_name=args.district,
        pincode=args.pincode,
        mode=args.mode,
        max_records=args.max_records,
        job_id=args.job_id
    )

    try:
        scraper.run(start_page=start, end_page=end, scrape_all=args.all_pages)
    except Exception as e:
        logger.exception("Scraper terminated with unexpected error: %s", e)
        # Update job as failed if job_id set
        if args.job_id:
            with SessionLocal() as db:
                job = db.query(ScrapingJob).filter(ScrapingJob.id == args.job_id).first()
                if job:
                    job.status = "FAILED"
                    job.error_message = str(e)
                    job.end_time = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()
        sys.exit(1)


if __name__ == "__main__":
    main()
