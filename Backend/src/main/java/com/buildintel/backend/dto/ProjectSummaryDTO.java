package com.buildintel.backend.dto;

import java.time.LocalDate;

/**
 * Lightweight project summary for nesting inside Builder responses
 * to prevent bidirectional circular references.
 */
public class ProjectSummaryDTO {
    private Integer id;
    private String registrationNumber;
    private String projectName;
    private String district;
    private String locality;
    private String projectStatus;
    private LocalDate lastModifiedDate;
    private String detailsUrl;

    public ProjectSummaryDTO() {
    }

    public ProjectSummaryDTO(Integer id, String registrationNumber, String projectName, String district,
                             String locality, String projectStatus, LocalDate lastModifiedDate, String detailsUrl) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.projectName = projectName;
        this.district = district;
        this.locality = locality;
        this.projectStatus = projectStatus;
        this.lastModifiedDate = lastModifiedDate;
        this.detailsUrl = detailsUrl;
    }

    public static ProjectSummaryDTOBuilder builder() {
        return new ProjectSummaryDTOBuilder();
    }

    public static class ProjectSummaryDTOBuilder {
        private Integer id;
        private String registrationNumber;
        private String projectName;
        private String district;
        private String locality;
        private String projectStatus;
        private LocalDate lastModifiedDate;
        private String detailsUrl;

        public ProjectSummaryDTOBuilder id(Integer id) { this.id = id; return this; }
        public ProjectSummaryDTOBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public ProjectSummaryDTOBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public ProjectSummaryDTOBuilder district(String district) { this.district = district; return this; }
        public ProjectSummaryDTOBuilder locality(String locality) { this.locality = locality; return this; }
        public ProjectSummaryDTOBuilder projectStatus(String projectStatus) { this.projectStatus = projectStatus; return this; }
        public ProjectSummaryDTOBuilder lastModifiedDate(LocalDate lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; return this; }
        public ProjectSummaryDTOBuilder detailsUrl(String detailsUrl) { this.detailsUrl = detailsUrl; return this; }

        public ProjectSummaryDTO build() {
            return new ProjectSummaryDTO(id, registrationNumber, projectName, district, locality, projectStatus, lastModifiedDate, detailsUrl);
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getProjectStatus() { return projectStatus; }
    public void setProjectStatus(String projectStatus) { this.projectStatus = projectStatus; }

    public LocalDate getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDate lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public String getDetailsUrl() { return detailsUrl; }
    public void setDetailsUrl(String detailsUrl) { this.detailsUrl = detailsUrl; }
}
