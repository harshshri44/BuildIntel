package com.buildintel.backend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PythonEnvironmentServiceTest {

    private final PythonEnvironmentService service = new PythonEnvironmentService();

    @Test
    @DisplayName("sanitizeError should mask Windows drive paths")
    void sanitizeError_shouldMaskWindowsPaths() {
        String input = "Error at C:\\Users\\Administrator\\Projects\\Scrapper\\scraper.py on line 42";
        String sanitized = service.sanitizeError(input);

        assertFalse(sanitized.contains("C:\\Users\\Administrator"));
        assertTrue(sanitized.contains("[server-file]"));
    }

    @Test
    @DisplayName("sanitizeError should mask Unix absolute paths")
    void sanitizeError_shouldMaskUnixPaths() {
        String input = "Fatal: file /var/www/buildintel/backend/app.jar missing";
        String sanitized = service.sanitizeError(input);

        assertFalse(sanitized.contains("/var/www/buildintel"));
        assertTrue(sanitized.contains("[server-path]"));
    }

    @Test
    @DisplayName("sanitizeError should return default message for null or empty input")
    void sanitizeError_shouldHandleNullOrEmpty() {
        assertEquals("An unexpected error occurred.", service.sanitizeError(null));
        assertEquals("An unexpected error occurred.", service.sanitizeError("   "));
    }
}
