"""
BuildIntel - MahaRERA PostgreSQL to Excel Exporter
Reads project and builder records from PostgreSQL and generates a clean,
professionally styled .xlsx workbook with multiple worksheets, frozen headers,
filters, auto-fitted columns, and clickable hyperlinks.
"""

import argparse
import datetime
import logging
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from sqlalchemy.orm import joinedload

# Ensure Scrapper package is resolvable regardless of working directory
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from database import SessionLocal
from models import Builder, Project

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("buildintel_exporter")


def export_database_to_excel(output_dir: Optional[Path] = None) -> Tuple[Path, int, int]:
    """
    Exports PostgreSQL projects and builders into a timestamped Excel file.
    Returns: (export_file_path, project_count, builder_count)
    """
    # 1. Determine destination directory (defaults to /exports at project root)
    if output_dir is None:
        project_root = current_dir.parent
        output_dir = project_root / "exports"

    output_dir.mkdir(parents=True, exist_ok=True)

    # 2. Generate unique timestamped filename
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    export_filename = f"BuildIntel_MahaRERA_{timestamp_str}.xlsx"
    export_path = output_dir / export_filename

    # Prevent accidental overwrites (adds counter suffix if exists)
    counter = 1
    while export_path.exists():
        export_filename = f"BuildIntel_MahaRERA_{timestamp_str}_{counter}.xlsx"
        export_path = output_dir / export_filename
        counter += 1

    # 3. Fetch data cleanly from PostgreSQL inside database session
    with SessionLocal() as db:
        # Projects with joined Builder
        projects_query = (
            db.query(Project)
            .options(joinedload(Project.builder))
            .order_by(Project.id)
            .all()
        )
        project_rows: List[Dict] = []
        for p in projects_query:
            bname = p.builder.builder_name if p.builder else "Unknown"
            last_mod = p.last_modified_date
            scraped_dt = p.scraped_at.replace(tzinfo=None) if p.scraped_at else None

            project_rows.append({
                "registration_number": p.registration_number,
                "project_name": p.project_name,
                "builder_name": bname,
                "state": p.state or "",
                "district": p.district or "",
                "pincode": p.pincode or "",
                "locality": p.locality or "",
                "last_modified_date": last_mod,
                "details_url": p.details_url or "",
                "original_application_url": p.original_application_url or "",
                "source_name": p.source_name or "MahaRERA",
                "scraped_at": scraped_dt,
            })

        # Builders
        builders_query = db.query(Builder).order_by(Builder.id).all()
        builder_rows: List[Dict] = []
        for b in builders_query:
            builder_rows.append({
                "id": b.id,
                "name": b.builder_name,
                "reg_no": b.registration_number or "N/A",
                "address": b.address or "N/A",
            })

        project_count = len(project_rows)
        builder_count = len(builder_rows)

    # 4. Create Workbook and Styles
    wb = openpyxl.Workbook()

    font_family = "Segoe UI"
    header_font = Font(name=font_family, size=11, bold=True, color="FFFFFF")
    data_font = Font(name=font_family, size=10, color="000000")
    link_font = Font(name=font_family, size=10, color="0D6EFD", underline="single")
    
    header_fill_projects = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    header_fill_builders = PatternFill(start_color="2F5597", end_color="2F5597", fill_type="solid")
    alt_row_fill = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
    
    thin_border = Border(
        left=Side(style="thin", color="E5E7EB"),
        right=Side(style="thin", color="E5E7EB"),
        top=Side(style="thin", color="E5E7EB"),
        bottom=Side(style="thin", color="E5E7EB")
    )
    align_left = Alignment(horizontal="left", vertical="center")
    align_center = Alignment(horizontal="center", vertical="center")

    # ==========================================
    # Sheet 1: Projects
    # ==========================================
    ws_projects = wb.active
    ws_projects.title = "Projects"
    ws_projects.views.sheetView[0].showGridLines = True

    project_headers = [
        "MahaRERA Registration Number",
        "Project Name",
        "Builder/Promoter Name",
        "State",
        "District",
        "Pincode",
        "Locality",
        "Last Modified Date",
        "Project Details URL",
        "Original Application URL",
        "Source Name",
        "Scraped At",
    ]

    ws_projects.append(project_headers)

    # Format Project Header Row
    for col_num, cell in enumerate(ws_projects[1], 1):
        cell.font = header_font
        cell.fill = header_fill_projects
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border
    ws_projects.row_dimensions[1].height = 28

    # Populate Project Rows
    for row_idx, p in enumerate(project_rows, start=2):
        row_data = [
            p["registration_number"],
            p["project_name"],
            p["builder_name"],
            p["state"],
            p["district"],
            p["pincode"],
            p["locality"],
            p["last_modified_date"],
            p["details_url"],
            p["original_application_url"],
            p["source_name"],
            p["scraped_at"],
        ]
        ws_projects.append(row_data)

        # Style data cells
        row_cells = ws_projects[row_idx]
        is_even = (row_idx % 2 == 0)
        row_fill = alt_row_fill if is_even else None

        for c_idx, cell in enumerate(row_cells, start=1):
            cell.font = data_font
            cell.border = thin_border
            if row_fill:
                cell.fill = row_fill

            # Check for URL fields (Col 9: Details URL, Col 10: Original Application URL)
            val_str = str(cell.value or "")
            if val_str.startswith("http://") or val_str.startswith("https://"):
                cell.hyperlink = val_str
                cell.font = link_font
                cell.alignment = align_left
            elif isinstance(cell.value, datetime.date) and not isinstance(cell.value, datetime.datetime):
                cell.number_format = "YYYY-MM-DD"
                cell.alignment = align_center
            elif isinstance(cell.value, datetime.datetime):
                cell.number_format = "YYYY-MM-DD HH:MM:SS"
                cell.alignment = align_center
            elif c_idx in (1, 4, 5, 6, 11):  # Reg No, State, District, Pincode, Source
                cell.alignment = align_center
            else:
                cell.alignment = align_left

        ws_projects.row_dimensions[row_idx].height = 20

    # Freeze header & apply auto-filter
    ws_projects.freeze_panes = "A2"
    ws_projects.auto_filter.ref = ws_projects.dimensions

    # Auto-adjust column widths
    _auto_fit_columns(ws_projects, min_width=12, max_width=65)

    # ==========================================
    # Sheet 2: Builders
    # ==========================================
    ws_builders = wb.create_sheet(title="Builders")
    ws_builders.views.sheetView[0].showGridLines = True

    builder_headers = [
        "Builder ID",
        "Builder Name",
        "Builder Registration Number",
        "Builder Address",
    ]

    ws_builders.append(builder_headers)

    # Format Builder Header Row
    for col_num, cell in enumerate(ws_builders[1], 1):
        cell.font = header_font
        cell.fill = header_fill_builders
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border
    ws_builders.row_dimensions[1].height = 28

    # Populate Builder Rows
    for row_idx, b in enumerate(builder_rows, start=2):
        row_data = [
            b["id"],
            b["name"],
            b["reg_no"],
            b["address"],
        ]
        ws_builders.append(row_data)

        row_cells = ws_builders[row_idx]
        is_even = (row_idx % 2 == 0)
        row_fill = alt_row_fill if is_even else None

        for c_idx, cell in enumerate(row_cells, start=1):
            cell.font = data_font
            cell.border = thin_border
            if row_fill:
                cell.fill = row_fill

            if c_idx in (1, 3):  # ID, Reg Number
                cell.alignment = align_center
            else:
                cell.alignment = align_left

        ws_builders.row_dimensions[row_idx].height = 20

    # Freeze header & apply auto-filter
    ws_builders.freeze_panes = "A2"
    ws_builders.auto_filter.ref = ws_builders.dimensions

    # Auto-adjust column widths
    _auto_fit_columns(ws_builders, min_width=14, max_width=60)

    # 5. Save workbook to disk
    wb.save(export_path)
    return export_path, project_count, builder_count


def _auto_fit_columns(worksheet, min_width: int = 12, max_width: int = 65):
    """Calculates and sets clean column widths based on maximum content length."""
    for col in worksheet.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val = cell.value
            if val is not None:
                if isinstance(val, datetime.date):
                    s = val.strftime("%Y-%m-%d")
                elif isinstance(val, datetime.datetime):
                    s = val.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    s = str(val)
                max_len = max(max_len, len(s))
        
        calculated = max(max_len + 3, min_width)
        worksheet.column_dimensions[col_letter].width = min(calculated, max_width)


def main():
    parser = argparse.ArgumentParser(description="Export MahaRERA database to Excel (.xlsx)")
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Custom destination directory for generated Excel files (default: project_root/exports)"
    )

    args = parser.parse_args()
    dest_dir = Path(args.output_dir) if args.output_dir else None

    try:
        export_file, projects_exported, builders_exported = export_database_to_excel(output_dir=dest_dir)
        print("\n" + "=" * 65)
        print(" BuildIntel - MahaRERA Database Excel Export Succeeded")
        print("=" * 65)
        print(f" File Saved To     : {export_file.resolve()}")
        print(f" Projects Exported : {projects_exported}")
        print(f" Builders Exported : {builders_exported}")
        print("=" * 65 + "\n")
    except Exception as e:
        logger.error("Failed to export database to Excel: %s", e, exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
