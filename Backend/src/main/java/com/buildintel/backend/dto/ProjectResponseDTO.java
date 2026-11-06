package com.buildintel.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Data Transfer Object representing a Project response.
 * Completely decouples clients from internal JPA entities.
 */
public class ProjectResponseDTO {
    private Integer id;
    private String registrationNumber;
    private String projectName;
    private Integer builderId;
    private String builderName;
    private String state;
    private String district;
    private String pincode;
    private String locality;
    private LocalDate lastModifiedDate;
    private LocalDate registrationDate;
    private String projectStatus;
    private String detailsUrl;
    private String originalApplicationUrl;
    private String sourceName;
    private OffsetDateTime scrapedAt;

    public ProjectResponseDTO() {
    }

    public ProjectResponseDTO(Integer id, String registrationNumber, String projectName, Integer builderId,
                              String builderName, String state, String district, String pincode, String locality,
                              LocalDate lastModifiedDate, LocalDate registrationDate, String projectStatus,
                              String detailsUrl, String originalApplicationUrl, String sourceName, OffsetDateTime scrapedAt) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.projectName = projectName;
        this.builderId = builderId;
        this.builderName = builderName;
        this.state = state;
        this.district = district;
        this.pincode = pincode;
        this.locality = locality;
        this.lastModifiedDate = lastModifiedDate;
        this.registrationDate = registrationDate;
        this.projectStatus = projectStatus;
        this.detailsUrl = detailsUrl;
        this.originalApplicationUrl = originalApplicationUrl;
        this.sourceName = sourceName;
        this.scrapedAt = scrapedAt;
    }

    public static ProjectResponseDTOBuilder builder() {
        return new ProjectResponseDTOBuilder();
    }

    public static class ProjectResponseDTOBuilder {
        private Integer id;
        private String registrationNumber;
        private String projectName;
        private Integer builderId;
        private String builderName;
        private String state;
        private String district;
        private String pincode;
        private String locality;
        private LocalDate lastModifiedDate;
        private LocalDate registrationDate;
        private String projectStatus;
        private String detailsUrl;
        private String originalApplicationUrl;
        private String sourceName;
        private OffsetDateTime scrapedAt;

        public ProjectResponseDTOBuilder id(Integer id) { this.id = id; return this; }
        public ProjectResponseDTOBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public ProjectResponseDTOBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public ProjectResponseDTOBuilder builderId(Integer builderId) { this.builderId = builderId; return this; }
        public ProjectResponseDTOBuilder builderName(String builderName) { this.builderName = builderName; return this; }
        public ProjectResponseDTOBuilder state(String state) { this.state = state; return this; }
        public ProjectResponseDTOBuilder district(String district) { this.district = district; return this; }
        public ProjectResponseDTOBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public ProjectResponseDTOBuilder locality(String locality) { this.locality = locality; return this; }
        public ProjectResponseDTOBuilder lastModifiedDate(LocalDate lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; return this; }
        public ProjectResponseDTOBuilder registrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; return this; }
        public ProjectResponseDTOBuilder projectStatus(String projectStatus) { this.projectStatus = projectStatus; return this; }
        public ProjectResponseDTOBuilder detailsUrl(String detailsUrl) { this.detailsUrl = detailsUrl; return this; }
        public ProjectResponseDTOBuilder originalApplicationUrl(String originalApplicationUrl) { this.originalApplicationUrl = originalApplicationUrl; return this; }
        public ProjectResponseDTOBuilder sourceName(String sourceName) { this.sourceName = sourceName; return this; }
        public ProjectResponseDTOBuilder scrapedAt(OffsetDateTime scrapedAt) { this.scrapedAt = scrapedAt; return this; }

        public ProjectResponseDTO build() {
            return new ProjectResponseDTO(id, registrationNumber, projectName, builderId, builderName, state,
                    district, pincode, locality, lastModifiedDate, registrationDate, projectStatus,
                    detailsUrl, originalApplicationUrl, sourceName, scrapedAt);
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public Integer getBuilderId() { return builderId; }
    public void setBuilderId(Integer builderId) { this.builderId = builderId; }

    public String getBuilderName() { return builderName; }
    public void setBuilderName(String builderName) { this.builderName = builderName; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public LocalDate getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(LocalDate lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public String getProjectStatus() { return projectStatus; }
    public void setProjectStatus(String projectStatus) { this.projectStatus = projectStatus; }

    public String getDetailsUrl() { return detailsUrl; }
    public void setDetailsUrl(String detailsUrl) { this.detailsUrl = detailsUrl; }

    public String getOriginalApplicationUrl() { return originalApplicationUrl; }
    public void setOriginalApplicationUrl(String originalApplicationUrl) { this.originalApplicationUrl = originalApplicationUrl; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public OffsetDateTime getScrapedAt() { return scrapedAt; }
    public void setScrapedAt(OffsetDateTime scrapedAt) { this.scrapedAt = scrapedAt; }
}
