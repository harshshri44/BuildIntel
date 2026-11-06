package com.buildintel.backend.controller;

import com.buildintel.backend.dto.DistrictOptionDTO;
import com.buildintel.backend.dto.PaginatedResponse;
import com.buildintel.backend.dto.ScrapingJobResponseDTO;
import com.buildintel.backend.dto.ScrapingRequestDTO;
import com.buildintel.backend.service.ScraperService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/scraper")
public class ScraperController {

    private final ScraperService scraperService;

    public ScraperController(ScraperService scraperService) {
        this.scraperService = scraperService;
    }

    
    @PostMapping("/start")
    public ResponseEntity<ScrapingJobResponseDTO> startScrapingJob(@Valid @RequestBody ScrapingRequestDTO request) {
        ScrapingJobResponseDTO job = scraperService.startScrapingJob(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
    }

    
    @GetMapping("/status/{jobId}")
    public ResponseEntity<ScrapingJobResponseDTO> getJobStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(scraperService.getJobStatus(jobId));
    }

    
    @GetMapping("/active")
    public ResponseEntity<ScrapingJobResponseDTO> getActiveJob() {
        ScrapingJobResponseDTO active = scraperService.getActiveJob();
        if (active != null) {
            return ResponseEntity.ok(active);
        }
        return ResponseEntity.noContent().build();
    }

    
    @GetMapping("/jobs")
    public ResponseEntity<PaginatedResponse<ScrapingJobResponseDTO>> getJobHistory(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(PaginatedResponse.from(scraperService.getJobHistory(pageable)));
    }

    
    @PostMapping("/cancel/{jobId}")
    public ResponseEntity<Void> cancelJob(@PathVariable String jobId) {
        boolean cancelled = scraperService.cancelJob(jobId);
        return cancelled ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

   
    @GetMapping("/districts")
    public ResponseEntity<List<DistrictOptionDTO>> getDistricts() {
        return ResponseEntity.ok(scraperService.getSupportedDistricts());
    }
}
