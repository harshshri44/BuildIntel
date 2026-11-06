package com.buildintel.backend.controller;

import com.buildintel.backend.dto.BuilderDetailResponseDTO;
import com.buildintel.backend.dto.BuilderResponseDTO;
import com.buildintel.backend.dto.PaginatedResponse;
import com.buildintel.backend.service.BuilderService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/builders")
public class BuilderController {

    private final BuilderService builderService;

    public BuilderController(BuilderService builderService) {
        this.builderService = builderService;
    }

   
    @GetMapping
    public ResponseEntity<PaginatedResponse<BuilderResponseDTO>> getAllBuilders(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PaginatedResponse.from(builderService.getAllBuilders(pageable)));
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<BuilderDetailResponseDTO> getBuilderById(@PathVariable Integer id) {
        return ResponseEntity.ok(builderService.getBuilderById(id));
    }
}
