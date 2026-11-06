package com.buildintel.backend.service;

import com.buildintel.backend.dto.BuilderDetailResponseDTO;
import com.buildintel.backend.dto.BuilderResponseDTO;
import com.buildintel.backend.dto.ProjectSummaryDTO;
import com.buildintel.backend.entity.Builder;
import com.buildintel.backend.entity.Project;
import com.buildintel.backend.exception.ResourceNotFoundException;
import com.buildintel.backend.repository.BuilderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Service
@Transactional(readOnly = true)
public class BuilderService {

    private final BuilderRepository builderRepository;

    @Autowired
    public BuilderService(BuilderRepository builderRepository) {
        this.builderRepository = builderRepository;
    }

   
    public Page<BuilderResponseDTO> getAllBuilders(Pageable pageable) {
        return builderRepository.findAll(pageable).map(this::mapToSummaryDTO);
    }

   
    public BuilderDetailResponseDTO getBuilderById(Integer id) {
        Builder builder = builderRepository.findByIdWithProjects(id)
                .orElseThrow(() -> new ResourceNotFoundException("Builder not found with id: " + id));
        return mapToDetailDTO(builder);
    }

    
    public BuilderResponseDTO mapToSummaryDTO(Builder b) {
        int projectCount = b.getProjects() != null ? b.getProjects().size() : 0;
        return BuilderResponseDTO.builder()
                .id(b.getId())
                .builderName(b.getBuilderName())
                .registrationNumber(b.getRegistrationNumber())
                .address(b.getAddress())
                .projectCount(projectCount)
                .build();
    }

    
    public BuilderDetailResponseDTO mapToDetailDTO(Builder b) {
        List<ProjectSummaryDTO> projectSummaries = b.getProjects() != null
                ? b.getProjects().stream().map(this::mapToProjectSummaryDTO).collect(Collectors.toList())
                : Collections.emptyList();

        return BuilderDetailResponseDTO.builder()
                .id(b.getId())
                .builderName(b.getBuilderName())
                .registrationNumber(b.getRegistrationNumber())
                .address(b.getAddress())
                .projects(projectSummaries)
                .build();
    }

    private ProjectSummaryDTO mapToProjectSummaryDTO(Project p) {
        return ProjectSummaryDTO.builder()
                .id(p.getId())
                .registrationNumber(p.getRegistrationNumber())
                .projectName(p.getProjectName())
                .district(p.getDistrict())
                .locality(p.getLocality())
                .projectStatus(p.getProjectStatus())
                .lastModifiedDate(p.getLastModifiedDate())
                .detailsUrl(p.getDetailsUrl())
                .build();
    }
}
