package com.buildintel.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;


@Service
public class ExportService {

    private static final Logger logger = LoggerFactory.getLogger(ExportService.class);

    private final PythonEnvironmentService pythonEnvService;

    @Autowired
    public ExportService(PythonEnvironmentService pythonEnvService) {
        this.pythonEnvService = pythonEnvService;
    }

    
    public File generateExcelExport() {
        try {
            File pythonExecutable = pythonEnvService.resolvePythonExecutable();
            File exportScript = pythonEnvService.resolveExportScript();
            File exportsDir = pythonEnvService.resolveExportsDirectory();

            List<String> command = new ArrayList<>();
            String pythonCmd = (pythonExecutable.isAbsolute() || pythonExecutable.exists())
                    ? pythonExecutable.getAbsolutePath()
                    : pythonExecutable.getPath();
            command.add(pythonCmd);
            command.add(exportScript.getAbsolutePath());
            command.add("--output-dir");
            command.add(exportsDir.getAbsolutePath());

            File exportDir = exportScript.getParentFile();
            File workingDir = null;
            if (exportDir != null && exportDir.exists() && exportDir.isDirectory()) {
                workingDir = exportDir.getAbsoluteFile();
            } else if (new File("../Scrapper").exists()) {
                workingDir = new File("../Scrapper").getAbsoluteFile();
            } else if (new File("Scrapper").exists()) {
                workingDir = new File("Scrapper").getAbsoluteFile();
            }

            ProcessBuilder pb = new ProcessBuilder(command);
            if (workingDir != null && workingDir.exists()) {
                pb.directory(workingDir);
                pb.environment().put("PYTHONPATH", workingDir.getAbsolutePath());
            }

            logger.info("Executing Excel export script: {}", command);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    logger.debug("[Export]: {}", line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IllegalStateException("Excel export process failed with exit code " + exitCode);
            }

            
            File[] files = exportsDir.listFiles((dir, name) -> name.endsWith(".xlsx"));
            if (files != null && files.length > 0) {
                Arrays.sort(files, Comparator.comparingLong((File f) -> f != null ? f.lastModified() : 0L).reversed());
                return files[0];
            }

            throw new IllegalStateException("Generated Excel file not found in " + exportsDir.getAbsolutePath());

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Excel export generation was interrupted", e);
        } catch (Exception e) {
            logger.error("Failed to generate Excel export", e);
            String safeMsg = pythonEnvService.sanitizeError(e.getMessage());
            throw new RuntimeException("Excel export generation failed: " + safeMsg, e);
        }
    }
}
