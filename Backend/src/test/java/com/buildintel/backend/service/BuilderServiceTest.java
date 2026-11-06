package com.buildintel.backend.service;

import com.buildintel.backend.dto.BuilderDetailResponseDTO;
import com.buildintel.backend.dto.BuilderResponseDTO;
import com.buildintel.backend.entity.Builder;
import com.buildintel.backend.entity.Project;
import com.buildintel.backend.exception.ResourceNotFoundException;
import com.buildintel.backend.repository.BuilderRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BuilderServiceTest {

    @Mock
    private BuilderRepository builderRepository;

    @InjectMocks
    private BuilderService builderService;

    private Builder sampleBuilder;

    @BeforeEach
    void setUp() {
        sampleBuilder = new Builder();
        sampleBuilder.setId(50);
        sampleBuilder.setBuilderName("Godrej Properties");
        sampleBuilder.setRegistrationNumber("DEV12345");
        sampleBuilder.setAddress("Mumbai, Maharashtra");

        Project p = new Project();
        p.setId(10);
        p.setProjectName("Godrej Woods");
        p.setRegistrationNumber("P51800000001");
        sampleBuilder.setProjects(new ArrayList<>(List.of(p)));
    }

    @Test
    @DisplayName("getAllBuilders should return paged summary DTOs with project counts")
    void getAllBuilders_shouldReturnPagedDTOs() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Builder> page = new PageImpl<>(List.of(sampleBuilder), pageable, 1);
        when(builderRepository.findAll(pageable)).thenReturn(page);

        Page<BuilderResponseDTO> result = builderService.getAllBuilders(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        BuilderResponseDTO dto = result.getContent().get(0);
        assertEquals("Godrej Properties", dto.getBuilderName());
        assertEquals(1, dto.getProjectCount());
    }

    @Test
    @DisplayName("getBuilderById should return detail DTO including project summaries")
    void getBuilderById_shouldReturnDetail_whenFound() {
        when(builderRepository.findByIdWithProjects(50)).thenReturn(Optional.of(sampleBuilder));

        BuilderDetailResponseDTO result = builderService.getBuilderById(50);

        assertNotNull(result);
        assertEquals(50, result.getId());
        assertEquals("Godrej Properties", result.getBuilderName());
        assertEquals(1, result.getProjects().size());
        assertEquals("Godrej Woods", result.getProjects().get(0).getProjectName());
    }

    @Test
    @DisplayName("getBuilderById should throw ResourceNotFoundException when builder not found")
    void getBuilderById_shouldThrowException_whenNotFound() {
        when(builderRepository.findByIdWithProjects(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> builderService.getBuilderById(999));
    }
}
