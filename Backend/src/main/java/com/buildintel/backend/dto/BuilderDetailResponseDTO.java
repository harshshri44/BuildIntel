package com.buildintel.backend.dto;

import java.util.List;


public class BuilderDetailResponseDTO {
    private Integer id;
    private String builderName;
    private String registrationNumber;
    private String address;
    private List<ProjectSummaryDTO> projects;

    public BuilderDetailResponseDTO() {
    }

    public BuilderDetailResponseDTO(Integer id, String builderName, String registrationNumber, String address, List<ProjectSummaryDTO> projects) {
        this.id = id;
        this.builderName = builderName;
        this.registrationNumber = registrationNumber;
        this.address = address;
        this.projects = projects;
    }

    public static BuilderDetailResponseDTOBuilder builder() {
        return new BuilderDetailResponseDTOBuilder();
    }

    public static class BuilderDetailResponseDTOBuilder {
        private Integer id;
        private String builderName;
        private String registrationNumber;
        private String address;
        private List<ProjectSummaryDTO> projects;

        public BuilderDetailResponseDTOBuilder id(Integer id) { this.id = id; return this; }
        public BuilderDetailResponseDTOBuilder builderName(String builderName) { this.builderName = builderName; return this; }
        public BuilderDetailResponseDTOBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public BuilderDetailResponseDTOBuilder address(String address) { this.address = address; return this; }
        public BuilderDetailResponseDTOBuilder projects(List<ProjectSummaryDTO> projects) { this.projects = projects; return this; }

        public BuilderDetailResponseDTO build() {
            return new BuilderDetailResponseDTO(id, builderName, registrationNumber, address, projects);
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getBuilderName() { return builderName; }
    public void setBuilderName(String builderName) { this.builderName = builderName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public List<ProjectSummaryDTO> getProjects() { return projects; }
    public void setProjects(List<ProjectSummaryDTO> projects) { this.projects = projects; }
}
