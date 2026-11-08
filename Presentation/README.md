# BuildIntel — Website Demo Presentation

This folder contains the official presentation deck for the **BuildIntel MahaRERA Real-Estate Intelligence Platform**.

---

## 📁 Presentation File

- **[`BuildIntel_Website_Demo.pptx`](BuildIntel_Website_Demo.pptx)**: 16:9 Widescreen executive presentation deck with embedded screenshots, feature highlights, problem/solution breakdown, and system architecture.

---

## 🖥️ Slide-by-Slide Outline & Speaker Notes

### Slide 1: Cover Slide
- **Title**: BuildIntel — MahaRERA Real-Estate Data & Intelligence Platform
- **Tagline**: Automated Data Collection, Exploration, and Intelligence Platform
- **Speaker Note**: *"Hello everyone. Today I'm presenting BuildIntel, a platform designed to collect, structure, and analyze real-estate project filings across Maharashtra."*

### Slide 2: The Challenge & The Solution
- **The Challenge**: Slow government search portals, individual project listings without cross-district search, no developer portfolio views, and no bulk data export options.
- **The Solution**: BuildIntel provides an automated Python scraper, instant multi-filter search, builder portfolio normalization, and 1-click Excel exports.

### Slide 3: Executive Dashboard (Screen 1)
- **Features Highlighted**:
  1. 4 Real-time metric counters: Total Projects, Registered Builders, Scraper Jobs Run, and District Coverage.
  2. Recent scraping job banner showing status and new additions.
  3. Visual progress bars showing project concentration across Maharashtra districts.

### Slide 4: Scraper Control (Screen 2)
- **Features Highlighted**:
  1. Target any of the 36 Maharashtra districts or filter by a 6-digit postal pincode.
  2. Flexible modes: 'Update Existing & Add New' (upsert) or 'Add New Only'.
  3. Live scraping history table showing pages processed, records added, and execution timestamps.

### Slide 5: Projects Directory (Screen 3)
- **Features Highlighted**:
  1. Multi-filter search by project name, registration ID, district, or pincode.
  2. Certified MahaRERA registration number badges with status and modification dates.
  3. Direct 1-click action to view project details or open the official government filing page.

### Slide 6: Promoters & Builders Directory (Screen 4)
- **Features Highlighted**:
  1. Normalized developer entities linking multiple developments to the parent promoter.
  2. Portfolio count badges showing active projects per promoter.
  3. Direct developer profile view to inspect all projects registered under a specific builder.

### Slide 7: Excel Data Export (Screen 5)
- **Features Highlighted**:
  1. 1-click instant workbook download generated dynamically by the backend.
  2. Dual-worksheet architecture: Sheet 1 for Projects and Sheet 2 for Builders/Promoters.
  3. Executive formatting: frozen headers, auto-fitted columns, and clickable hyperlinks.

### Slide 8: System Architecture & Tech Stack
- **Frontend**: Angular 21 (SPA) with standalone components and Nginx.
- **Backend**: Spring Boot 4 / Java 25 REST API with Spring Data JPA.
- **Scraper**: Python 3 with BeautifulSoup, SQLAlchemy 2.0, and psycopg v3.
- **Database & DevOps**: PostgreSQL 16+ relational schema, Docker Compose orchestration.

### Slide 9: Conclusion & Highlights
- **Key Takeaways**: Real-world business impact, 33 automated tests passing, clean and readable UI.
- **GitHub Repository**: [https://github.com/harshshri44/BuildIntel](https://github.com/harshshri44/BuildIntel)
