from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Boolean,
    func
)
from sqlalchemy.orm import relationship

from database import Base


class Builder(Base):
    __tablename__ = "builders"

    id = Column(Integer, primary_key=True, index=True)
    builder_name = Column(String(255), nullable=False, index=True)
    registration_number = Column(String(100), unique=True, nullable=True)
    address = Column(Text, nullable=True)

    projects = relationship(
        "Project",
        back_populates="builder",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Builder(id={self.id}, name='{self.builder_name}')>"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(100), unique=True, nullable=False, index=True)
    project_name = Column(String(255), nullable=False, index=True)

    # Builder foreign key & relationship
    builder_id = Column(Integer, ForeignKey("builders.id"), nullable=True, index=True)
    builder = relationship("Builder", back_populates="projects")

    # Geographical fields
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    locality = Column(String(255), nullable=True)

    # Dates
    last_modified_date = Column(Date, nullable=True)
    registration_date = Column(Date, nullable=True)

    # Status & URLs
    project_status = Column(String(100), nullable=True)
    details_url = Column(Text, nullable=True)
    original_application_url = Column(Text, nullable=True)

    # Source & Auditing
    source_name = Column(String(50), default="MahaRERA", nullable=False)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Project(reg_no='{self.registration_number}', name='{self.project_name}')>"


class ScrapingJob(Base):
    __tablename__ = "scraping_jobs"

    id = Column(String(36), primary_key=True, index=True)
    status = Column(String(30), nullable=False, default="QUEUED", index=True)
    district = Column(String(100), nullable=True)
    district_code = Column(String(20), nullable=True)
    pincode = Column(String(20), nullable=True)
    mode = Column(String(30), nullable=True, default="upsert")
    start_page = Column(Integer, nullable=False, default=1)
    max_pages = Column(Integer, nullable=False, default=1)
    max_records = Column(Integer, nullable=False, default=0)
    scrape_all = Column(Boolean, nullable=False, default=False)
    pages_processed = Column(Integer, nullable=False, default=0)
    total_pages = Column(Integer, nullable=False, default=0)
    records_discovered = Column(Integer, nullable=False, default=0)
    records_inserted = Column(Integer, nullable=False, default=0)
    records_updated = Column(Integer, nullable=False, default=0)
    records_skipped = Column(Integer, nullable=False, default=0)
    records_failed = Column(Integer, nullable=False, default=0)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<ScrapingJob(id='{self.id}', status='{self.status}', pages={self.pages_processed}/{self.max_pages})>"
