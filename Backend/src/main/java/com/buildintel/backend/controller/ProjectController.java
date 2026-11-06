package com.buildintel.backend.controller;

import com.buildintel.backend.dto.PaginatedResponse;
import com.buildintel.backend.dto.ProjectResponseDTO;
import com.buildintel.backend.service.ProjectService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

   
    @GetMapping
    public ResponseEntity<PaginatedResponse<ProjectResponseDTO>> getAllProjects(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PaginatedResponse.from(projectService.getAllProjects(pageable)));
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Integer id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<ProjectResponseDTO>> searchProjects(
            @RequestParam(name = "keyword", required = false, defaultValue = "") String keyword,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PaginatedResponse.from(projectService.searchProjects(keyword, pageable)));
    }

   
    @GetMapping("/filter")
    public ResponseEntity<PaginatedResponse<ProjectResponseDTO>> filterProjects(
            @RequestParam(name = "district", required = false) String district,
            @RequestParam(name = "pincode", required = false) String pincode,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PaginatedResponse.from(projectService.filterProjects(district, pincode, pageable)));
    }

    
    @GetMapping("/builder/{builderId}")
    public ResponseEntity<PaginatedResponse<ProjectResponseDTO>> getProjectsByBuilder(
            @PathVariable Integer builderId,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PaginatedResponse.from(projectService.getProjectsByBuilder(builderId, pageable)));
    }
}
