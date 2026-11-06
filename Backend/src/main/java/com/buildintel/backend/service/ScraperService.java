package com.buildintel.backend.service;

import com.buildintel.backend.dto.DashboardStatsDTO;
import com.buildintel.backend.dto.DistrictOptionDTO;
import com.buildintel.backend.dto.ScrapingJobResponseDTO;
import com.buildintel.backend.dto.ScrapingRequestDTO;
import com.buildintel.backend.entity.ScrapingJob;
import com.buildintel.backend.exception.ResourceNotFoundException;
import com.buildintel.backend.repository.BuilderRepository;
import com.buildintel.backend.repository.ProjectRepository;
import com.buildintel.backend.repository.ScrapingJobRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.*;


@Service
public class ScraperService {

    private static final Logger logger = LoggerFactory.getLogger(ScraperService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ScrapingJobRepository scrapingJobRepository;
    private final ProjectRepository projectRepository;
    private final BuilderRepository builderRepository;
    private final PythonEnvironmentService pythonEnvService;

    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private final ConcurrentHashMap<String, Process> activeProcesses = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, List<String>> jobLogs = new ConcurrentHashMap<>();

    // Verified MahaRERA Districts (36 districts) mapped to their portal numeric codes
    public static final Map<String, String> MAHARASHTRA_DISTRICTS = new LinkedHashMap<>();
    static {
        MAHARASHTRA_DISTRICTS.put("Ahmednagar", "522");
        MAHARASHTRA_DISTRICTS.put("Akola", "501");
        MAHARASHTRA_DISTRICTS.put("Amravati", "503");
        MAHARASHTRA_DISTRICTS.put("Aurangabad", "515");
        MAHARASHTRA_DISTRICTS.put("Beed", "523");
        MAHARASHTRA_DISTRICTS.put("Bhandara", "506");
        MAHARASHTRA_DISTRICTS.put("Buldana", "500");
        MAHARASHTRA_DISTRICTS.put("Chandrapur", "509");
        MAHARASHTRA_DISTRICTS.put("Dharashiv", "992");
        MAHARASHTRA_DISTRICTS.put("Dhule", "498");
        MAHARASHTRA_DISTRICTS.put("Gadchiroli", "508");
        MAHARASHTRA_DISTRICTS.put("Gondiya", "507");
        MAHARASHTRA_DISTRICTS.put("Hingoli", "512");
        MAHARASHTRA_DISTRICTS.put("Jalgaon", "499");
        MAHARASHTRA_DISTRICTS.put("Jalna", "514");
        MAHARASHTRA_DISTRICTS.put("Kolhapur", "530");
        MAHARASHTRA_DISTRICTS.put("Latur", "524");
        MAHARASHTRA_DISTRICTS.put("Mumbai City", "519");
        MAHARASHTRA_DISTRICTS.put("Mumbai Suburban", "518");
        MAHARASHTRA_DISTRICTS.put("Nagpur", "505");
        MAHARASHTRA_DISTRICTS.put("Nanded", "511");
        MAHARASHTRA_DISTRICTS.put("Nandurbar", "497");
        MAHARASHTRA_DISTRICTS.put("Nashik", "516");
        MAHARASHTRA_DISTRICTS.put("Osmanabad", "525");
        MAHARASHTRA_DISTRICTS.put("Palghar", "990");
        MAHARASHTRA_DISTRICTS.put("Parbhani", "513");
        MAHARASHTRA_DISTRICTS.put("Pune", "521");
        MAHARASHTRA_DISTRICTS.put("Raigarh", "520");
        MAHARASHTRA_DISTRICTS.put("Ratnagiri", "528");
        MAHARASHTRA_DISTRICTS.put("Sangli", "531");
        MAHARASHTRA_DISTRICTS.put("Satara", "527");
        MAHARASHTRA_DISTRICTS.put("Sindhudurg", "529");
        MAHARASHTRA_DISTRICTS.put("Solapur", "526");
        MAHARASHTRA_DISTRICTS.put("Thane", "517");
        MAHARASHTRA_DISTRICTS.put("Wardha", "504");
        MAHARASHTRA_DISTRICTS.put("Washim", "502");
        MAHARASHTRA_DISTRICTS.put("Yavatmal", "510");
    }

    public ScraperService(
            ScrapingJobRepository scrapingJobRepository,
            ProjectRepository projectRepository,
            BuilderRepository builderRepository,
            PythonEnvironmentService pythonEnvService
    ) {
        this.scrapingJobRepository = scrapingJobRepository;
        this.projectRepository = projectRepository;
        this.builderRepository = builderRepository;
        this.pythonEnvService = pythonEnvService;
    }

    
    public synchronized ScrapingJobResponseDTO startScrapingJob(ScrapingRequestDTO request) {
        
        if (scrapingJobRepository.existsByStatusIn(List.of("QUEUED", "RUNNING"))) {
            throw new IllegalStateException("A scraping job is already in progress. Please wait for it to complete.");
        }

        
        int startPage = (request.getStartPage() != null && request.getStartPage() > 0) ? request.getStartPage() : 1;
        int maxPages = (request.getMaxPages() != null && request.getMaxPages() > 0) ? request.getMaxPages() : 1;
        int maxRecords = (request.getMaxRecords() != null && request.getMaxRecords() >= 0) ? request.getMaxRecords() : 0;
        boolean scrapeAll = Boolean.TRUE.equals(request.getScrapeAll());
        String mode = "new_only".equalsIgnoreCase(request.getMode()) ? "new_only" : "upsert";

        
        String district = (request.getDistrict() != null && !request.getDistrict().trim().isEmpty())
                ? request.getDistrict().trim() : null;
        String districtCode = (request.getDistrictCode() != null && !request.getDistrictCode().trim().isEmpty())
                ? request.getDistrictCode().trim() : null;

        if (districtCode == null && district != null) {
            districtCode = resolveDistrictCode(district);
            if (districtCode != null) {
                district = resolveDistrictName(districtCode);
            }
        } else if (district == null && districtCode != null) {
            district = resolveDistrictName(districtCode);
        } else if (district != null && districtCode != null) {
            String canonName = resolveDistrictName(districtCode);
            if (canonName != null) {
                district = canonName;
            } else {
                districtCode = resolveDistrictCode(district);
            }
        }

        String pincode = (request.getPincode() != null && !request.getPincode().trim().isEmpty())
                ? request.getPincode().trim() : null;

        
        String jobId = UUID.randomUUID().toString();
        ScrapingJob job = new ScrapingJob();
        job.setId(jobId);
        job.setStatus("QUEUED");
        job.setDistrict(district);
        job.setDistrictCode(districtCode);
        job.setPincode(pincode);
        job.setMode(mode);
        job.setStartPage(startPage);
        job.setMaxPages(maxPages);
        job.setMaxRecords(maxRecords);
        job.setScrapeAll(scrapeAll);
        job.setPagesProcessed(0);
        job.setTotalPages(scrapeAll ? 0 : maxPages);
        job.setRecordsDiscovered(0);
        job.setRecordsInserted(0);
        job.setRecordsUpdated(0);
        job.setRecordsSkipped(0);
        job.setRecordsFailed(0);
        job.setStartTime(OffsetDateTime.now());

        scrapingJobRepository.save(job);
        jobLogs.put(jobId, new CopyOnWriteArrayList<>(List.of(
                "Job queued with configuration: district=" + (district != null ? district : "All") +
                ", pages=" + startPage + ".." + (scrapeAll ? "ALL" : (startPage + maxPages - 1)) +
                ", mode=" + mode
        )));

        
        final String finalDistrict = district;
        final String finalDistrictCode = districtCode;
        final String finalPincode = pincode;

        executorService.submit(() -> runScraperProcess(
                jobId, startPage, maxPages, scrapeAll, finalDistrict, finalDistrictCode, finalPincode, mode, maxRecords
        ));

        return mapToDTO(job, getLogsForJob(jobId));
    }

    private void runScraperProcess(
            String jobId,
            int startPage,
            int maxPages,
            boolean scrapeAll,
            String district,
            String districtCode,
            String pincode,
            String mode,
            int maxRecords
    ) {
        try {
            updateJobStatus(jobId, "RUNNING", null);
            appendLog(jobId, "Initializing Python scraper process...");

            File pythonExecutable = pythonEnvService.resolvePythonExecutable();
            File scraperScript = pythonEnvService.resolveScraperScript();
            File scraperDir = scraperScript.getParentFile();
            File workingDir = null;
            if (scraperDir != null && scraperDir.exists() && scraperDir.isDirectory()) {
                workingDir = scraperDir.getAbsoluteFile();
            } else if (new File("../Scrapper").exists()) {
                workingDir = new File("../Scrapper").getAbsoluteFile();
            } else if (new File("Scrapper").exists()) {
                workingDir = new File("Scrapper").getAbsoluteFile();
            }

            List<String> command = new ArrayList<>();
            String pythonCmd = (pythonExecutable.isAbsolute() || pythonExecutable.exists())
                    ? pythonExecutable.getAbsolutePath()
                    : pythonExecutable.getPath();
            command.add(pythonCmd);
            command.add(scraperScript.getAbsolutePath());
            command.add("--job-id");
            command.add(jobId);
            command.add("--start-page");
            command.add(String.valueOf(startPage));

            if (scrapeAll) {
                command.add("--all-pages");
            } else {
                command.add("--max-pages");
                command.add(String.valueOf(maxPages));
            }

            if (districtCode != null) {
                command.add("--district-code");
                command.add(districtCode);
            }
            if (district != null) {
                command.add("--district");
                command.add(district);
            }
            if (pincode != null) {
                command.add("--pincode");
                command.add(pincode);
            }

            command.add("--mode");
            command.add(mode);

            if (maxRecords > 0) {
                command.add("--max-records");
                command.add(String.valueOf(maxRecords));
            }

            command.add("--delay");
            command.add("1.5");

            ProcessBuilder pb = new ProcessBuilder(command);
            if (workingDir != null && workingDir.exists()) {
                pb.directory(workingDir);
                pb.environment().put("PYTHONPATH", workingDir.getAbsolutePath());
            }
            pb.environment().put("PYTHONUNBUFFERED", "1");

            logger.info("Executing scraper process for job {}: {}", jobId, command);
            Process process = pb.start();
            activeProcesses.put(jobId, process);

            // Read stdout in background
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    processOutputLine(jobId, line);
                }
            }

            
            StringBuilder errorOutput = new StringBuilder();
            try (BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                String errLine;
                while ((errLine = errReader.readLine()) != null) {
                    errorOutput.append(errLine).append("\n");
                    appendLog(jobId, "[Scraper Error] " + pythonEnvService.sanitizeError(errLine));
                }
            }

            int exitCode = process.waitFor();
            activeProcesses.remove(jobId);

            if (exitCode == 0) {
                appendLog(jobId, "Scraping process finished successfully.");
                finalizeJobStatus(jobId, "COMPLETED", null);
            } else {
                String errMsg = "Scraper process exited with code " + exitCode + ". " + pythonEnvService.sanitizeError(errorOutput.toString());
                logger.error("Scraper job {} failed: {}", jobId, errMsg);
                appendLog(jobId, "Scraper terminated with exit code " + exitCode);
                finalizeJobStatus(jobId, "FAILED", errMsg);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Scraper job {} was interrupted", jobId);
            appendLog(jobId, "Scraper execution was cancelled.");
            finalizeJobStatus(jobId, "STOPPED", "Scraping job was cancelled by user.");
        } catch (Exception e) {
            logger.error("Error executing scraper job " + jobId, e);
            String safeMsg = "Scraper execution error: " + pythonEnvService.sanitizeError(e.getMessage());
            appendLog(jobId, safeMsg);
            finalizeJobStatus(jobId, "FAILED", safeMsg);
        } finally {
            activeProcesses.remove(jobId);
        }
    }

    private void processOutputLine(String jobId, String line) {
        if (line == null || line.trim().isEmpty()) {
            return;
        }

        if (line.startsWith("PROGRESS_JSON:")) {
            try {
                String jsonStr = line.substring("PROGRESS_JSON:".length()).trim();
                JsonNode node = objectMapper.readTree(jsonStr);

                int pagesProcessed = node.path("pages_processed").asInt(0);
                int totalPages = node.path("total_pages").asInt(0);
                int discovered = node.path("records_discovered").asInt(0);
                int inserted = node.path("records_inserted").asInt(0);
                int updated = node.path("records_updated").asInt(0);
                int skipped = node.path("records_skipped").asInt(0);
                int failed = node.path("records_failed").asInt(0);
                String msg = node.path("message").asString("");

                updateJobProgress(jobId, pagesProcessed, totalPages, discovered, inserted, updated, skipped, failed);
                if (!msg.isEmpty()) {
                    appendLog(jobId, msg);
                }
            } catch (Exception e) {
                logger.warn("Failed to parse progress JSON: {}", line);
            }
        } else {
            // General log line from scraper
            if (!line.contains("===") && !line.startsWith(" BuildIntel") && !line.startsWith(" Fetched Records")) {
                appendLog(jobId, line.trim());
            }
        }
    }

    private void appendLog(String jobId, String message) {
        List<String> logs = jobLogs.computeIfAbsent(jobId, k -> new CopyOnWriteArrayList<>());
        if (logs.size() > 150) {
            logs.remove(0); 
        }
        logs.add(message);
    }

    private List<String> getLogsForJob(String jobId) {
        List<String> list = jobLogs.get(jobId);
        return list != null ? new ArrayList<>(list) : Collections.emptyList();
    }

    @Transactional
    public void updateJobStatus(String jobId, String status, String errorMessage) {
        scrapingJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(status);
            if (errorMessage != null) {
                job.setErrorMessage(errorMessage);
            }
            if ("RUNNING".equals(status) && job.getStartTime() == null) {
                job.setStartTime(OffsetDateTime.now());
            }
            scrapingJobRepository.save(job);
        });
    }

    @Transactional
    public void updateJobProgress(
            String jobId,
            int pagesProcessed,
            int totalPages,
            int discovered,
            int inserted,
            int updated,
            int skipped,
            int failed
    ) {
        scrapingJobRepository.findById(jobId).ifPresent(job -> {
            job.setPagesProcessed(pagesProcessed);
            if (totalPages > 0) {
                job.setTotalPages(totalPages);
            }
            job.setRecordsDiscovered(discovered);
            job.setRecordsInserted(inserted);
            job.setRecordsUpdated(updated);
            job.setRecordsSkipped(skipped);
            job.setRecordsFailed(failed);
            job.setStatus("RUNNING");
            scrapingJobRepository.save(job);
        });
    }

    @Transactional
    public void finalizeJobStatus(String jobId, String status, String errorMessage) {
        scrapingJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(status);
            job.setEndTime(OffsetDateTime.now());
            if (errorMessage != null) {
                job.setErrorMessage(errorMessage);
            }
            scrapingJobRepository.save(job);
        });
    }

    
    public boolean cancelJob(String jobId) {
        Process process = activeProcesses.get(jobId);
        if (process != null && process.isAlive()) {
            process.destroyForcibly();
            activeProcesses.remove(jobId);
            finalizeJobStatus(jobId, "STOPPED", "Cancelled by user.");
            appendLog(jobId, "Job cancelled by user request.");
            return true;
        }
        return false;
    }

    
    public ScrapingJobResponseDTO getJobStatus(String jobId) {
        ScrapingJob job = scrapingJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Scraping job not found: " + jobId));
        return mapToDTO(job, getLogsForJob(jobId));
    }

   
    public ScrapingJobResponseDTO getActiveJob() {
        List<ScrapingJob> active = scrapingJobRepository.findByStatusIn(List.of("QUEUED", "RUNNING"));
        if (!active.isEmpty()) {
            ScrapingJob job = active.get(0);
            return mapToDTO(job, getLogsForJob(job.getId()));
        }
        return null;
    }

   
    public Page<ScrapingJobResponseDTO> getJobHistory(Pageable pageable) {
        return scrapingJobRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(j -> mapToDTO(j, Collections.emptyList()));
    }

    
    public String resolveDistrictCode(String districtName) {
        if (districtName == null) {
            return null;
        }
        String cleaned = districtName.trim();
        if (cleaned.isEmpty() || cleaned.equalsIgnoreCase("all") || cleaned.equals("0") || cleaned.equalsIgnoreCase("none")) {
            return null;
        }
        if (cleaned.matches("^\\d+$")) {
            if (MAHARASHTRA_DISTRICTS.containsValue(cleaned)) {
                return cleaned;
            }
            return null;
        }
        for (Map.Entry<String, String> entry : MAHARASHTRA_DISTRICTS.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(cleaned)) {
                return entry.getValue();
            }
        }
        for (Map.Entry<String, String> entry : MAHARASHTRA_DISTRICTS.entrySet()) {
            if (entry.getKey().toLowerCase().contains(cleaned.toLowerCase())) {
                return entry.getValue();
            }
        }
        return null;
    }

    public String resolveDistrictName(String districtCode) {
        if (districtCode == null) {
            return null;
        }
        String cleaned = districtCode.trim();
        if (cleaned.isEmpty() || cleaned.equalsIgnoreCase("all") || cleaned.equals("0") || cleaned.equalsIgnoreCase("none")) {
            return null;
        }
        for (Map.Entry<String, String> entry : MAHARASHTRA_DISTRICTS.entrySet()) {
            if (entry.getValue().equals(cleaned)) {
                return entry.getKey();
            }
        }
        return null;
    }

    public List<DistrictOptionDTO> getSupportedDistricts() {
        List<Object[]> rawCounts = projectRepository.countProjectsByDistrict();
        Map<String, Long> countMap = new HashMap<>();
        for (Object[] row : rawCounts) {
            String distName = (String) row[0];
            Long count = (Long) row[1];
            if (distName != null) {
                countMap.put(distName.toLowerCase(), count);
            }
        }

        List<DistrictOptionDTO> result = new ArrayList<>();
        for (Map.Entry<String, String> entry : MAHARASHTRA_DISTRICTS.entrySet()) {
            String name = entry.getKey();
            String code = entry.getValue();
            long count = countMap.getOrDefault(name.toLowerCase(), 0L);
            result.add(new DistrictOptionDTO(name, code, count));
        }

        return result;
    }

    
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO dto = new DashboardStatsDTO();
        dto.setTotalProjects(projectRepository.count());
        dto.setTotalBuilders(builderRepository.count());
        dto.setCompletedJobsCount(scrapingJobRepository.countByStatus("COMPLETED"));
        dto.setActiveJobsCount(scrapingJobRepository.countByStatus("RUNNING") + scrapingJobRepository.countByStatus("QUEUED"));

        Optional<ScrapingJob> recent = scrapingJobRepository.findTop1ByOrderByStartTimeDesc();
        recent.ifPresent(j -> {
            dto.setRecentJob(mapToDTO(j, Collections.emptyList()));
            dto.setLastScrapedAt(j.getEndTime() != null ? j.getEndTime() : j.getStartTime());
        });

        
        List<DistrictOptionDTO> districts = getSupportedDistricts();
        districts.sort((a, b) -> Long.compare(b.getProjectCount(), a.getProjectCount()));
        dto.setTopDistricts(districts.subList(0, Math.min(5, districts.size())));

        return dto;
    }

    private ScrapingJobResponseDTO mapToDTO(ScrapingJob job, List<String> logs) {
        ScrapingJobResponseDTO dto = new ScrapingJobResponseDTO();
        dto.setJobId(job.getId());
        dto.setStatus(job.getStatus());
        dto.setDistrict(job.getDistrict());
        dto.setDistrictCode(job.getDistrictCode());
        dto.setPincode(job.getPincode());
        dto.setMode(job.getMode());
        dto.setStartPage(job.getStartPage());
        dto.setMaxPages(job.getMaxPages());
        dto.setMaxRecords(job.getMaxRecords());
        dto.setScrapeAll(job.getScrapeAll());
        dto.setPagesProcessed(job.getPagesProcessed());
        dto.setTotalPages(job.getTotalPages());
        dto.setRecordsDiscovered(job.getRecordsDiscovered());
        dto.setRecordsInserted(job.getRecordsInserted());
        dto.setRecordsUpdated(job.getRecordsUpdated());
        dto.setRecordsSkipped(job.getRecordsSkipped());
        dto.setRecordsFailed(job.getRecordsFailed());
        dto.setStartTime(job.getStartTime());
        dto.setEndTime(job.getEndTime());
        dto.setErrorMessage(job.getErrorMessage());
        dto.setLogs(logs);
        return dto;
    }
}
