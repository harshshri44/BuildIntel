package com.buildintel.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;


@Entity
@Table(name = "scraping_jobs")
public class ScrapingJob {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "status", length = 30, nullable = false)
    private String status; // QUEUED, RUNNING, COMPLETED, FAILED, STOPPED

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "district_code", length = 20)
    private String districtCode;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "mode", length = 30)
    private String mode; // upsert, new_only

    @Column(name = "start_page", nullable = false)
    private Integer startPage = 1;

    @Column(name = "max_pages", nullable = false)
    private Integer maxPages = 1;

    @Column(name = "max_records", nullable = false)
    private Integer maxRecords = 0;

    @Column(name = "scrape_all", nullable = false)
    private Boolean scrapeAll = false;

    @Column(name = "pages_processed", nullable = false)
    private Integer pagesProcessed = 0;

    @Column(name = "total_pages", nullable = false)
    private Integer totalPages = 0;

    @Column(name = "records_discovered", nullable = false)
    private Integer recordsDiscovered = 0;

    @Column(name = "records_inserted", nullable = false)
    private Integer recordsInserted = 0;

    @Column(name = "records_updated", nullable = false)
    private Integer recordsUpdated = 0;

    @Column(name = "records_skipped", nullable = false)
    private Integer recordsSkipped = 0;

    @Column(name = "records_failed", nullable = false)
    private Integer recordsFailed = 0;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public ScrapingJob() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getDistrictCode() {
        return districtCode;
    }

    public void setDistrictCode(String districtCode) {
        this.districtCode = districtCode;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public Integer getStartPage() {
        return startPage;
    }

    public void setStartPage(Integer startPage) {
        this.startPage = startPage;
    }

    public Integer getMaxPages() {
        return maxPages;
    }

    public void setMaxPages(Integer maxPages) {
        this.maxPages = maxPages;
    }

    public Integer getMaxRecords() {
        return maxRecords;
    }

    public void setMaxRecords(Integer maxRecords) {
        this.maxRecords = maxRecords;
    }

    public Boolean getScrapeAll() {
        return scrapeAll;
    }

    public void setScrapeAll(Boolean scrapeAll) {
        this.scrapeAll = scrapeAll;
    }

    public Integer getPagesProcessed() {
        return pagesProcessed;
    }

    public void setPagesProcessed(Integer pagesProcessed) {
        this.pagesProcessed = pagesProcessed;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Integer getRecordsDiscovered() {
        return recordsDiscovered;
    }

    public void setRecordsDiscovered(Integer recordsDiscovered) {
        this.recordsDiscovered = recordsDiscovered;
    }

    public Integer getRecordsInserted() {
        return recordsInserted;
    }

    public void setRecordsInserted(Integer recordsInserted) {
        this.recordsInserted = recordsInserted;
    }

    public Integer getRecordsUpdated() {
        return recordsUpdated;
    }

    public void setRecordsUpdated(Integer recordsUpdated) {
        this.recordsUpdated = recordsUpdated;
    }

    public Integer getRecordsSkipped() {
        return recordsSkipped;
    }

    public void setRecordsSkipped(Integer recordsSkipped) {
        this.recordsSkipped = recordsSkipped;
    }

    public Integer getRecordsFailed() {
        return recordsFailed;
    }

    public void setRecordsFailed(Integer recordsFailed) {
        this.recordsFailed = recordsFailed;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
