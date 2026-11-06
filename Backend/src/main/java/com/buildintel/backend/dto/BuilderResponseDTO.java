package com.buildintel.backend.dto;

/**
 * Data Transfer Object representing a Builder summary.
 */
public class BuilderResponseDTO {
    private Integer id;
    private String builderName;
    private String registrationNumber;
    private String address;
    private int projectCount;

    public BuilderResponseDTO() {
    }

    public BuilderResponseDTO(Integer id, String builderName, String registrationNumber, String address, int projectCount) {
        this.id = id;
        this.builderName = builderName;
        this.registrationNumber = registrationNumber;
        this.address = address;
        this.projectCount = projectCount;
    }

    public static BuilderResponseDTOBuilder builder() {
        return new BuilderResponseDTOBuilder();
    }

    public static class BuilderResponseDTOBuilder {
        private Integer id;
        private String builderName;
        private String registrationNumber;
        private String address;
        private int projectCount;

        public BuilderResponseDTOBuilder id(Integer id) { this.id = id; return this; }
        public BuilderResponseDTOBuilder builderName(String builderName) { this.builderName = builderName; return this; }
        public BuilderResponseDTOBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public BuilderResponseDTOBuilder address(String address) { this.address = address; return this; }
        public BuilderResponseDTOBuilder projectCount(int projectCount) { this.projectCount = projectCount; return this; }

        public BuilderResponseDTO build() {
            return new BuilderResponseDTO(id, builderName, registrationNumber, address, projectCount);
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

    public int getProjectCount() { return projectCount; }
    public void setProjectCount(int projectCount) { this.projectCount = projectCount; }
}
