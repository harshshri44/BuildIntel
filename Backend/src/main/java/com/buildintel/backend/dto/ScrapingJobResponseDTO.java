package com.buildintel.backend.dto;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class ScrapingJobResponseDTO {

    private String jobId;
    private String status;
    private String district;
    private String districtCode;
    private String pincode;
    private String mode;
    private Integer startPage;
    private Integer maxPages;
    private Integer maxRecords;
    private Boolean scrapeAll;
    private Integer pagesProcessed;
    private Integer totalPages;
    private Integer recordsDiscovered;
    private Integer recordsInserted;
    private Integer recordsUpdated;
    private Integer recordsSkipped;
    private Integer recordsFailed;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String errorMessage;
    private List<String> logs = new ArrayList<>();

    public ScrapingJobResponseDTO() {
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
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

    public List<String> getLogs() {
        return logs;
    }

    public void setLogs(List<String> logs) {
        this.logs = logs;
    }
}
