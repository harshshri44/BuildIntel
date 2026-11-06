package com.buildintel.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;


@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "project_name", nullable = false, length = 255)
    private String projectName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "builder_id")
    private Builder builder;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "locality", length = 255)
    private String locality;

    @Column(name = "last_modified_date")
    private LocalDate lastModifiedDate;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "project_status", length = 100)
    private String projectStatus;

    @Column(name = "details_url", columnDefinition = "text")
    private String detailsUrl;

    @Column(name = "original_application_url", columnDefinition = "text")
    private String originalApplicationUrl;

    @Column(name = "source_name", nullable = false, length = 50)
    private String sourceName;

    @Column(name = "scraped_at", nullable = false)
    private OffsetDateTime scrapedAt;

    public Project() {
    }

    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Builder getBuilder() {
        return builder;
    }

    public void setBuilder(Builder builder) {
        this.builder = builder;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public LocalDate getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDate lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(String projectStatus) {
        this.projectStatus = projectStatus;
    }

    public String getDetailsUrl() {
        return detailsUrl;
    }

    public void setDetailsUrl(String detailsUrl) {
        this.detailsUrl = detailsUrl;
    }

    public String getOriginalApplicationUrl() {
        return originalApplicationUrl;
    }

    public void setOriginalApplicationUrl(String originalApplicationUrl) {
        this.originalApplicationUrl = originalApplicationUrl;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public OffsetDateTime getScrapedAt() {
        return scrapedAt;
    }

    public void setScrapedAt(OffsetDateTime scrapedAt) {
        this.scrapedAt = scrapedAt;
    }
}
