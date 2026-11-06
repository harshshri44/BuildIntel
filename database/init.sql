-- ==============================================================================
-- BuildIntel - MahaRERA Real-Estate Data Platform
-- Database Schema Initialization
-- Compatible with PostgreSQL 15, 16, and 17
-- ==============================================================================

-- 1. Builders Table (Developer/Promoter entities)
CREATE TABLE IF NOT EXISTS builders (
    id SERIAL PRIMARY KEY,
    builder_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    address TEXT
);

CREATE INDEX IF NOT EXISTS idx_builders_name ON builders(builder_name);
CREATE INDEX IF NOT EXISTS idx_builders_reg_no ON builders(registration_number);

-- 2. Projects Table (MahaRERA registered real-estate projects)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    builder_id INTEGER REFERENCES builders(id) ON DELETE CASCADE,
    state VARCHAR(100),
    district VARCHAR(100),
    pincode VARCHAR(20),
    locality VARCHAR(255),
    last_modified_date DATE,
    registration_date DATE,
    project_status VARCHAR(100),
    details_url TEXT,
    original_application_url TEXT,
    source_name VARCHAR(50) NOT NULL DEFAULT 'MahaRERA',
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_reg_no ON projects(registration_number);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(project_name);
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district);
CREATE INDEX IF NOT EXISTS idx_projects_pincode ON projects(pincode);
CREATE INDEX IF NOT EXISTS idx_projects_builder_id ON projects(builder_id);

-- 3. Scraping Jobs Table (Job status and progress tracking metrics)
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id VARCHAR(36) PRIMARY KEY,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    district VARCHAR(100),
    district_code VARCHAR(20),
    pincode VARCHAR(20),
    mode VARCHAR(30) DEFAULT 'upsert',
    start_page INTEGER NOT NULL DEFAULT 1,
    max_pages INTEGER NOT NULL DEFAULT 1,
    max_records INTEGER NOT NULL DEFAULT 0,
    scrape_all BOOLEAN NOT NULL DEFAULT FALSE,
    pages_processed INTEGER NOT NULL DEFAULT 0,
    total_pages INTEGER NOT NULL DEFAULT 0,
    records_discovered INTEGER NOT NULL DEFAULT 0,
    records_inserted INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_skipped INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at);

