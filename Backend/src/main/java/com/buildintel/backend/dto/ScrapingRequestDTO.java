package com.buildintel.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object representing user configuration when triggering
 * an asynchronous MahaRERA scraping job.
 */
public class ScrapingRequestDTO {

    @Size(max = 100, message = "District name must not exceed 100 characters")
    private String district;

    @Size(max = 20, message = "District code must not exceed 20 characters")
    private String districtCode;

    @Pattern(regexp = "^[0-9]{6}$|^$", message = "Pincode must be a valid 6-digit postal code")
    private String pincode;

    @Min(value = 1, message = "Start page must be at least 1")
    @Max(value = 5000, message = "Start page cannot exceed 5000")
    private Integer startPage = 1;

    @Min(value = 1, message = "Pages to scrape must be at least 1")
    @Max(value = 100, message = "Pages to scrape cannot exceed 100 per job")
    private Integer maxPages = 1;

    @Min(value = 0, message = "Record limit cannot be negative")
    private Integer maxRecords = 0;

    private Boolean scrapeAll = false;

    @Pattern(regexp = "^(upsert|new_only)$", message = "Mode must be either 'upsert' or 'new_only'")
    private String mode = "upsert";

    public ScrapingRequestDTO() {
    }

    public ScrapingRequestDTO(String district, Integer startPage, Integer maxPages, String mode) {
        this.district = district;
        this.startPage = startPage;
        this.maxPages = maxPages;
        this.mode = mode;
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

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
