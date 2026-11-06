package com.buildintel.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class DashboardStatsDTO {

    private long totalProjects;
    private long totalBuilders;
    private long completedJobsCount;
    private long activeJobsCount;
    private OffsetDateTime lastScrapedAt;
    private ScrapingJobResponseDTO recentJob;
    private List<DistrictOptionDTO> topDistricts;

    public DashboardStatsDTO() {
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getTotalBuilders() {
        return totalBuilders;
    }

    public void setTotalBuilders(long totalBuilders) {
        this.totalBuilders = totalBuilders;
    }

    public long getCompletedJobsCount() {
        return completedJobsCount;
    }

    public void setCompletedJobsCount(long completedJobsCount) {
        this.completedJobsCount = completedJobsCount;
    }

    public long getActiveJobsCount() {
        return activeJobsCount;
    }

    public void setActiveJobsCount(long activeJobsCount) {
        this.activeJobsCount = activeJobsCount;
    }

    public OffsetDateTime getLastScrapedAt() {
        return lastScrapedAt;
    }

    public void setLastScrapedAt(OffsetDateTime lastScrapedAt) {
        this.lastScrapedAt = lastScrapedAt;
    }

    public ScrapingJobResponseDTO getRecentJob() {
        return recentJob;
    }

    public void setRecentJob(ScrapingJobResponseDTO recentJob) {
        this.recentJob = recentJob;
    }

    public List<DistrictOptionDTO> getTopDistricts() {
        return topDistricts;
    }

    public void setTopDistricts(List<DistrictOptionDTO> topDistricts) {
        this.topDistricts = topDistricts;
    }
}
