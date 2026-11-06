"""
Unit tests for BuildIntel MahaRERA scraper utilities and parsing pipeline.
Can be executed with: python -m unittest test_scraper.py
"""

import datetime
import unittest
from unittest.mock import MagicMock, patch
from scraper import MahaRERAScraper, resolve_district_code, resolve_district_name, MAHARASHTRA_DISTRICTS


SAMPLE_CARD_HTML = """
<div class="row shadow p-3 mb-5 bg-body rounded">
  <div class="col-md-12">
    <p class="p-0">#P50500000005</p>
    <h4 class="title4">Green Meadows Phase 2</h4>
    <p class="darkBlue bold">Apex Realty Infra Ltd</p>
    <div>
      <em class="fa-location-dot"></em>
      <span>Wardha Road, Nagpur</span>
    </div>
    <div class="row">
      <div class="col-xl-4">
        <div class="greyColor">State</div>
        <p>MAHARASHTRA</p>
      </div>
      <div class="col-xl-4">
        <div class="greyColor">District</div>
        <p>Nagpur</p>
      </div>
      <div class="col-xl-4">
        <div class="greyColor">Pincode</div>
        <p>441108</p>
      </div>
      <div class="col-xl-4">
        <div class="greyColor">Last Modified</div>
        <p>15/08/2025</p>
      </div>
    </div>
    <div>
      <a href="https://maharera.gov.in/details/P50500000005">View Details</a>
      <a href="https://maharera.gov.in/app/P50500000005">Original Application</a>
    </div>
  </div>
</div>
"""


class TestMahaRERAScraper(unittest.TestCase):

    def setUp(self):
        self.scraper = MahaRERAScraper(delay_seconds=0, timeout_seconds=5)

    def test_resolve_district_code_exact(self):
        self.assertEqual(resolve_district_code("Pune"), "521")
        self.assertEqual(resolve_district_code("Nagpur"), "505")
        self.assertEqual(resolve_district_code("Thane"), "517")

    def test_resolve_district_code_case_insensitive(self):
        self.assertEqual(resolve_district_code("pune"), "521")
        self.assertEqual(resolve_district_code("NAGPUR"), "505")

    def test_resolve_district_code_numeric(self):
        self.assertEqual(resolve_district_code("505"), "505")
        self.assertEqual(resolve_district_code("521"), "521")
        # Invalid numeric code should safely return None
        self.assertIsNone(resolve_district_code("99999"))

    def test_resolve_district_code_empty_or_all(self):
        self.assertIsNone(resolve_district_code(None))
        self.assertIsNone(resolve_district_code(""))
        self.assertIsNone(resolve_district_code("   "))
        self.assertIsNone(resolve_district_code("all"))
        self.assertIsNone(resolve_district_code("0"))
        self.assertIsNone(resolve_district_code("none"))
        self.assertIsNone(resolve_district_code("UnknownDistrict"))

    def test_resolve_district_name_valid(self):
        self.assertEqual(resolve_district_name("521"), "Pune")
        self.assertEqual(resolve_district_name("518"), "Mumbai Suburban")
        self.assertEqual(resolve_district_name("517"), "Thane")
        self.assertEqual(resolve_district_name("505"), "Nagpur")
        self.assertEqual(resolve_district_name("990"), "Palghar")
        self.assertEqual(resolve_district_name("992"), "Dharashiv")

    def test_resolve_district_name_invalid_or_empty(self):
        self.assertIsNone(resolve_district_name(None))
        self.assertIsNone(resolve_district_name(""))
        self.assertIsNone(resolve_district_name("   "))
        self.assertIsNone(resolve_district_name("99999"))
        self.assertIsNone(resolve_district_name("all"))
        self.assertIsNone(resolve_district_name("invalid"))

    def test_all_37_districts_round_trip(self):
        self.assertEqual(len(MAHARASHTRA_DISTRICTS), 37)
        for name, code in MAHARASHTRA_DISTRICTS.items():
            self.assertTrue(code.isdigit(), f"District code for {name} must be digits: {code}")
            self.assertEqual(resolve_district_code(name), code, f"Name to code failed for: {name}")
            self.assertEqual(resolve_district_name(code), name, f"Code to name failed for: {code}")

    def test_fetch_page_html_sends_district_code_param(self):
        scraper = MahaRERAScraper(district_code="521", delay_seconds=0)
        with patch.object(scraper.session, "get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = '<div class="row shadow p-3 mb-5 bg-body rounded"></div>'
            mock_get.return_value = mock_resp

            html = scraper.fetch_page_html(1)
            self.assertIsNotNone(html)
            mock_get.assert_called_once()
            _, kwargs = mock_get.call_args
            self.assertIn("params", kwargs)
            params = kwargs["params"]
            self.assertEqual(params.get("project_district"), "521")
            self.assertEqual(params.get("project_state"), "27")
            self.assertEqual(params.get("project_type"), "0")
            self.assertEqual(params.get("page"), "1")

    def test_fetch_page_html_without_district_code_omits_param(self):
        scraper = MahaRERAScraper(district_code=None, district_name=None, delay_seconds=0)
        with patch.object(scraper.session, "get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = '<div class="row shadow p-3 mb-5 bg-body rounded"></div>'
            mock_get.return_value = mock_resp

            html = scraper.fetch_page_html(1)
            self.assertIsNotNone(html)
            mock_get.assert_called_once()
            _, kwargs = mock_get.call_args
            self.assertIn("params", kwargs)
            params = kwargs["params"]
            self.assertNotIn("project_district", params)

    def test_parse_date_formats(self):
        self.assertEqual(
            self.scraper.parse_date("2025-05-20"),
            datetime.date(2025, 5, 20)
        )
        self.assertEqual(
            self.scraper.parse_date("15/08/2025"),
            datetime.date(2025, 8, 15)
        )
        self.assertEqual(
            self.scraper.parse_date("01-01-2024"),
            datetime.date(2024, 1, 1)
        )

    def test_parse_date_invalid(self):
        self.assertIsNone(self.scraper.parse_date(None))
        self.assertIsNone(self.scraper.parse_date(""))
        self.assertIsNone(self.scraper.parse_date("N/A"))
        self.assertIsNone(self.scraper.parse_date("invalid-date"))

    def test_parse_project_cards(self):
        records = self.scraper.parse_project_cards(SAMPLE_CARD_HTML)
        self.assertEqual(len(records), 1)

        rec = records[0]
        self.assertEqual(rec["registration_number"], "P50500000005")
        self.assertEqual(rec["project_name"], "Green Meadows Phase 2")
        self.assertEqual(rec["builder_name"], "Apex Realty Infra Ltd")
        self.assertEqual(rec["district"], "Nagpur")
        self.assertEqual(rec["pincode"], "441108")
        self.assertEqual(rec["last_modified_date"], datetime.date(2025, 8, 15))
        self.assertEqual(rec["details_url"], "https://maharera.gov.in/details/P50500000005")
        self.assertEqual(rec["original_application_url"], "https://maharera.gov.in/app/P50500000005")


if __name__ == "__main__":
    unittest.main()
