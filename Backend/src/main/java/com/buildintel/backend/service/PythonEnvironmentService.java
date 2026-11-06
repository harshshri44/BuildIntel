package com.buildintel.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;


@Service
public class PythonEnvironmentService {

    private static final Logger logger = LoggerFactory.getLogger(PythonEnvironmentService.class);

    
    public File resolvePythonExecutable() {
        String envPython = System.getenv("PYTHON_EXECUTABLE");
        if (envPython != null && !envPython.trim().isEmpty()) {
            File custom = new File(envPython.trim());
            if (custom.exists()) {
                logger.debug("Resolved Python executable from PYTHON_EXECUTABLE: {}", custom.getAbsolutePath());
                return custom.getAbsoluteFile();
            }
            logger.debug("Using configured PYTHON_EXECUTABLE command: {}", envPython.trim());
            return new File(envPython.trim());
        }

        File[] candidates = new File[] {
                new File("../venv/Scripts/python.exe"),
                new File("venv/Scripts/python.exe"),
                new File("../venv/bin/python"),
                new File("venv/bin/python"),
                new File("../.venv/Scripts/python.exe"),
                new File(".venv/Scripts/python.exe"),
                new File("../.venv/bin/python"),
                new File(".venv/bin/python"),
                new File("/app/venv/bin/python"),
                new File("/venv/bin/python"),
                new File("/usr/bin/python3"),
                new File("/usr/local/bin/python3"),
                new File("/usr/bin/python")
        };

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                logger.debug("Resolved Python executable in virtualenv: {}", candidate.getAbsolutePath());
                return candidate.getAbsoluteFile();
            }
        }

        logger.warn("Virtual environment Python binary not found. Falling back to system 'python'.");
        return new File("python");
    }

    
    public File resolveScraperScript() {
        String envScript = System.getenv("SCRAPER_SCRIPT_PATH");
        if (envScript != null && !envScript.trim().isEmpty()) {
            File custom = new File(envScript.trim());
            if (custom.exists() && custom.isFile()) {
                return custom.getAbsoluteFile();
            }
        }

        File[] candidates = new File[] {
                new File("../Scrapper/scraper.py"),
                new File("Scrapper/scraper.py"),
                new File("./Scrapper/scraper.py"),
                new File("/app/Scrapper/scraper.py")
        };

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                return candidate.getAbsoluteFile();
            }
        }

        throw new IllegalStateException("MahaRERA scraper script (scraper.py) not found in workspace.");
    }

    
    public File resolveExportScript() {
        String envExport = System.getenv("EXPORT_SCRIPT_PATH");
        if (envExport != null && !envExport.trim().isEmpty()) {
            File custom = new File(envExport.trim());
            if (custom.exists() && custom.isFile()) {
                return custom.getAbsoluteFile();
            }
        }

        File[] candidates = new File[] {
                new File("../Scrapper/export_excel.py"),
                new File("Scrapper/export_excel.py"),
                new File("./Scrapper/export_excel.py"),
                new File("/app/Scrapper/export_excel.py")
        };

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                return candidate.getAbsoluteFile();
            }
        }

        throw new IllegalStateException("Excel export utility script (export_excel.py) not found in workspace.");
    }

    
    public File resolveExportsDirectory() {
        String envExportsDir = System.getenv("EXPORTS_DIR");
        if (envExportsDir != null && !envExportsDir.trim().isEmpty()) {
            File dir = new File(envExportsDir.trim());
            if (!dir.exists()) {
                dir.mkdirs();
            }
            return dir.getAbsoluteFile();
        }

        File script = resolveExportScript();
        File parent = script.getParentFile();
        File projectRoot = (parent != null && parent.getParentFile() != null)
                ? parent.getParentFile()
                : new File(".");
        File exportsDir = new File(projectRoot, "exports");
        if (!exportsDir.exists()) {
            exportsDir.mkdirs();
        }
        return exportsDir.getAbsoluteFile();
    }

    
    public String sanitizeError(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return "An unexpected error occurred.";
        }
        return raw.replaceAll("[A-Za-z]:\\\\[^\\s:]+", "[server-file]")
                  .replaceAll("/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_./-]+", "[server-path]")
                  .trim();
    }
}
