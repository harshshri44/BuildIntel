package com.buildintel.backend.service;

import com.buildintel.backend.dto.DistrictOptionDTO;
import com.buildintel.backend.dto.ScrapingJobResponseDTO;
import com.buildintel.backend.dto.ScrapingRequestDTO;
import com.buildintel.backend.repository.BuilderRepository;
import com.buildintel.backend.repository.ProjectRepository;
import com.buildintel.backend.repository.ScrapingJobRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScraperServiceTest {

    @Mock
    private ScrapingJobRepository scrapingJobRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private BuilderRepository builderRepository;

    @Mock
    private PythonEnvironmentService pythonEnvService;

    @InjectMocks
    private ScraperService scraperService;

    @Test
    @DisplayName("startScrapingJob should throw IllegalStateException when an active job is already running")
    void startScrapingJob_shouldRejectConcurrentJob() {
        when(scrapingJobRepository.existsByStatusIn(List.of("QUEUED", "RUNNING"))).thenReturn(true);

        ScrapingRequestDTO req = new ScrapingRequestDTO();
        req.setDistrict("Pune");

        assertThrows(IllegalStateException.class, () -> scraperService.startScrapingJob(req));
        verify(scrapingJobRepository, never()).save(any());
    }

    @Test
    @DisplayName("getSupportedDistricts should return all Maharashtra districts mapped with live counts")
    void getSupportedDistricts_shouldReturn37Districts() {
        Object[] puneCount = new Object[]{"Pune", 15L};
        Object[] nagpurCount = new Object[]{"Nagpur", 8L};
        when(projectRepository.countProjectsByDistrict()).thenReturn(List.of(puneCount, nagpurCount));

        List<DistrictOptionDTO> districts = scraperService.getSupportedDistricts();

        assertNotNull(districts);
        assertEquals(37, districts.size());

        DistrictOptionDTO pune = districts.stream()
                .filter(d -> "Pune".equalsIgnoreCase(d.getName()))
                .findFirst()
                .orElse(null);
        assertNotNull(pune);
        assertEquals("521", pune.getCode());
        assertEquals(15L, pune.getProjectCount());
    }

    @Test
    @DisplayName("cancelJob should return false when job process is not active in memory")
    void cancelJob_shouldReturnFalse_whenNotActive() {
        boolean result = scraperService.cancelJob("non-existent-job-id");
        assertFalse(result);
    }

    @Test
    @DisplayName("resolveDistrictCode should correctly map valid district names to numeric portal codes")
    void resolveDistrictCode_shouldMapValidNames() {
        assertEquals("521", scraperService.resolveDistrictCode("Pune"));
        assertEquals("521", scraperService.resolveDistrictCode("pune"));
        assertEquals("521", scraperService.resolveDistrictCode("PUNE"));
        assertEquals("518", scraperService.resolveDistrictCode("Mumbai Suburban"));
        assertEquals("517", scraperService.resolveDistrictCode("Thane"));
        assertEquals("505", scraperService.resolveDistrictCode("Nagpur"));
        assertEquals("521", scraperService.resolveDistrictCode("521"));
    }

    @Test
    @DisplayName("resolveDistrictCode should safely return null for invalid, empty, or wildcard inputs")
    void resolveDistrictCode_shouldHandleInvalidInputs() {
        assertNull(scraperService.resolveDistrictCode(null));
        assertNull(scraperService.resolveDistrictCode(""));
        assertNull(scraperService.resolveDistrictCode("   "));
        assertNull(scraperService.resolveDistrictCode("all"));
        assertNull(scraperService.resolveDistrictCode("0"));
        assertNull(scraperService.resolveDistrictCode("none"));
        assertNull(scraperService.resolveDistrictCode("Atlantis"));
        assertNull(scraperService.resolveDistrictCode("99999"));
    }

    @Test
    @DisplayName("resolveDistrictName should correctly map numeric portal codes back to canonical names")
    void resolveDistrictName_shouldMapValidCodes() {
        assertEquals("Pune", scraperService.resolveDistrictName("521"));
        assertEquals("Mumbai Suburban", scraperService.resolveDistrictName("518"));
        assertEquals("Thane", scraperService.resolveDistrictName("517"));
        assertEquals("Nagpur", scraperService.resolveDistrictName("505"));
        assertEquals("Palghar", scraperService.resolveDistrictName("990"));
        assertEquals("Dharashiv", scraperService.resolveDistrictName("992"));
    }

    @Test
    @DisplayName("resolveDistrictName should safely return null for invalid or empty codes")
    void resolveDistrictName_shouldHandleInvalidCodes() {
        assertNull(scraperService.resolveDistrictName(null));
        assertNull(scraperService.resolveDistrictName(""));
        assertNull(scraperService.resolveDistrictName("   "));
        assertNull(scraperService.resolveDistrictName("99999"));
        assertNull(scraperService.resolveDistrictName("invalid"));
        assertNull(scraperService.resolveDistrictName("all"));
    }

    @Test
    @DisplayName("All 37 Maharashtra districts should successfully round-trip between name and code")
    void allDistricts_shouldRoundTripBiDirectionally() {
        assertEquals(37, ScraperService.MAHARASHTRA_DISTRICTS.size());

        for (var entry : ScraperService.MAHARASHTRA_DISTRICTS.entrySet()) {
            String name = entry.getKey();
            String code = entry.getValue();

            assertTrue(code.matches("^\\d+$"), "District code must be numeric: " + code);
            assertEquals(code, scraperService.resolveDistrictCode(name), "Name to code failed for: " + name);
            assertEquals(name, scraperService.resolveDistrictName(code), "Code to name failed for: " + code);
        }
    }

    @Test
    @DisplayName("startScrapingJob should resolve district code and normalize district name")
    void startScrapingJob_shouldResolveAndNormalizeDistrict() {
        when(scrapingJobRepository.existsByStatusIn(List.of("QUEUED", "RUNNING"))).thenReturn(false);
        lenient().when(pythonEnvService.resolvePythonExecutable()).thenReturn(new java.io.File("python"));
        lenient().when(pythonEnvService.resolveScraperScript()).thenReturn(new java.io.File("Scrapper/scraper.py"));

        ScrapingRequestDTO req = new ScrapingRequestDTO();
        req.setDistrict("pune"); // lowercase
        req.setStartPage(1);
        req.setMaxPages(2);

        ScrapingJobResponseDTO result = scraperService.startScrapingJob(req);

        assertNotNull(result);
        assertEquals("Pune", result.getDistrict());
        assertEquals("521", result.getDistrictCode());
        verify(scrapingJobRepository).save(argThat(job ->
                "Pune".equals(job.getDistrict()) && "521".equals(job.getDistrictCode())
        ));
    }
}
