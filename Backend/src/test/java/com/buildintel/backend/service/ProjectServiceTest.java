package com.buildintel.backend.service;

import com.buildintel.backend.dto.ProjectResponseDTO;
import com.buildintel.backend.entity.Builder;
import com.buildintel.backend.entity.Project;
import com.buildintel.backend.exception.ResourceNotFoundException;
import com.buildintel.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project sampleProject;
    private Builder sampleBuilder;

    @BeforeEach
    void setUp() {
        sampleBuilder = new Builder();
        sampleBuilder.setId(101);
        sampleBuilder.setBuilderName("Apex Developers");

        sampleProject = new Project();
        sampleProject.setId(1);
        sampleProject.setRegistrationNumber("P50500000001");
        sampleProject.setProjectName("Green Acres");
        sampleProject.setBuilder(sampleBuilder);
        sampleProject.setDistrict("Nagpur");
        sampleProject.setPincode("440001");
        sampleProject.setLastModifiedDate(LocalDate.of(2025, 5, 20));
    }

    @Test
    @DisplayName("getAllProjects should return paginated project DTOs")
    void getAllProjects_shouldReturnPagedDTOs() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Project> page = new PageImpl<>(List.of(sampleProject), pageable, 1);
        when(projectRepository.findAll(pageable)).thenReturn(page);

        Page<ProjectResponseDTO> result = projectService.getAllProjects(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        ProjectResponseDTO dto = result.getContent().get(0);
        assertEquals("P50500000001", dto.getRegistrationNumber());
        assertEquals("Green Acres", dto.getProjectName());
        assertEquals("Apex Developers", dto.getBuilderName());
        assertEquals(101, dto.getBuilderId());
    }

    @Test
    @DisplayName("getProjectById should return mapped DTO when project exists")
    void getProjectById_shouldReturnDTO_whenExists() {
        when(projectRepository.findById(1)).thenReturn(Optional.of(sampleProject));

        ProjectResponseDTO result = projectService.getProjectById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Green Acres", result.getProjectName());
        assertEquals("Nagpur", result.getDistrict());
    }

    @Test
    @DisplayName("getProjectById should throw ResourceNotFoundException when project not found")
    void getProjectById_shouldThrowException_whenNotFound() {
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById(999));
    }

    @Test
    @DisplayName("searchProjects should query repository with cleaned keyword")
    void searchProjects_shouldQueryRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Project> page = new PageImpl<>(List.of(sampleProject), pageable, 1);
        when(projectRepository.findByProjectNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(
                eq("green"), eq("green"), eq(pageable)
        )).thenReturn(page);

        Page<ProjectResponseDTO> result = projectService.searchProjects("  green  ", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(projectRepository).findByProjectNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(
                "green", "green", pageable
        );
    }

    @Test
    @DisplayName("filterProjects with district and pincode should query combined repository method")
    void filterProjects_withBothFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Project> page = new PageImpl<>(List.of(sampleProject), pageable, 1);
        when(projectRepository.findByDistrictIgnoreCaseAndPincode("Nagpur", "440001", pageable))
                .thenReturn(page);

        Page<ProjectResponseDTO> result = projectService.filterProjects("Nagpur", "440001", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(projectRepository).findByDistrictIgnoreCaseAndPincode("Nagpur", "440001", pageable);
    }
}
