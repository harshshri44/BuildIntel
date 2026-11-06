package com.buildintel.backend.dto;

public class DistrictOptionDTO {

    private String name;
    private String code;
    private long projectCount;

    public DistrictOptionDTO() {
    }

    public DistrictOptionDTO(String name, String code, long projectCount) {
        this.name = name;
        this.code = code;
        this.projectCount = projectCount;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public long getProjectCount() {
        return projectCount;
    }

    public void setProjectCount(long projectCount) {
        this.projectCount = projectCount;
    }
}
