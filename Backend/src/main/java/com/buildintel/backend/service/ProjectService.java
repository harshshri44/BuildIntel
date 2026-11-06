package com.buildintel.backend.service;

import com.buildintel.backend.dto.ProjectResponseDTO;
import com.buildintel.backend.entity.Project;
import com.buildintel.backend.exception.ResourceNotFoundException;
import com.buildintel.backend.repository.ProjectRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    
    public Page<ProjectResponseDTO> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::mapToDTO);
    }

    
    public ProjectResponseDTO getProjectById(Integer id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDTO(project);
    }

    
    public Page<ProjectResponseDTO> searchProjects(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProjects(pageable);
        }
        String cleanKeyword = keyword.trim();
        return projectRepository.findByProjectNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(
                cleanKeyword, cleanKeyword, pageable
        ).map(this::mapToDTO);
    }

    
    public Page<ProjectResponseDTO> filterProjects(String district, String pincode, Pageable pageable) {
        String cleanDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : null;
        String cleanPincode = (pincode != null && !pincode.trim().isEmpty()) ? pincode.trim() : null;

        if (cleanDistrict != null && cleanPincode != null) {
            return projectRepository.findByDistrictIgnoreCaseAndPincode(
                    cleanDistrict, cleanPincode, pageable
            ).map(this::mapToDTO);
        } else if (cleanDistrict != null) {
            return projectRepository.findByDistrictIgnoreCase(cleanDistrict, pageable)
                    .map(this::mapToDTO);
        } else if (cleanPincode != null) {
            return projectRepository.findByPincode(cleanPincode, pageable)
                    .map(this::mapToDTO);
        } else {
            return getAllProjects(pageable);
        }
    }

    
    public Page<ProjectResponseDTO> getProjectsByBuilder(Integer builderId, Pageable pageable) {
        return projectRepository.findByBuilderId(builderId, pageable).map(this::mapToDTO);
    }

    
    public ProjectResponseDTO mapToDTO(Project p) {
        Integer builderId = p.getBuilder() != null ? p.getBuilder().getId() : null;
        String builderName = p.getBuilder() != null ? p.getBuilder().getBuilderName() : "Unknown";

        return ProjectResponseDTO.builder()
                .id(p.getId())
                .registrationNumber(p.getRegistrationNumber())
                .projectName(p.getProjectName())
                .builderId(builderId)
                .builderName(builderName)
                .state(p.getState())
                .district(p.getDistrict())
                .pincode(p.getPincode())
                .locality(p.getLocality())
                .lastModifiedDate(p.getLastModifiedDate())
                .registrationDate(p.getRegistrationDate())
                .projectStatus(p.getProjectStatus())
                .detailsUrl(p.getDetailsUrl())
                .originalApplicationUrl(p.getOriginalApplicationUrl())
                .sourceName(p.getSourceName())
                .scrapedAt(p.getScrapedAt())
                .build();
    }
}
