package com.buildintel.backend.controller;

import com.buildintel.backend.dto.DashboardStatsDTO;
import com.buildintel.backend.service.ScraperService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ScraperService scraperService;

    public DashboardController(ScraperService scraperService) {
        this.scraperService = scraperService;
    }

    
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(scraperService.getDashboardStats());
    }
}
