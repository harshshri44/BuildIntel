package com.buildintel.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "builders")
public class Builder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "builder_name", nullable = false, length = 255)
    private String builderName;

    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Column(name = "address", columnDefinition = "text")
    private String address;

    @OneToMany(mappedBy = "builder", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Project> projects = new ArrayList<>();

    public Builder() {
    }

    public Builder(Integer id, String builderName, String registrationNumber, String address) {
        this.id = id;
        this.builderName = builderName;
        this.registrationNumber = registrationNumber;
        this.address = address;
        this.projects = new ArrayList<>();
    }

    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getBuilderName() {
        return builderName;
    }

    public void setBuilderName(String builderName) {
        this.builderName = builderName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<Project> getProjects() {
        return projects;
    }

    public void setProjects(List<Project> projects) {
        this.projects = projects;
    }
}
