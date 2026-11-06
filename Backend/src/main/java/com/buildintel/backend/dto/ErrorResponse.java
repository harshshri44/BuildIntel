package com.buildintel.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Standardized error structure for API exceptions.
 */
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private OffsetDateTime timestamp;
    private List<String> details;

    public ErrorResponse() {
    }

    public ErrorResponse(int status, String error, String message, String path, OffsetDateTime timestamp, List<String> details) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = timestamp;
        this.details = details;
    }

    public static ErrorResponseBuilder builder() {
        return new ErrorResponseBuilder();
    }

    public static class ErrorResponseBuilder {
        private int status;
        private String error;
        private String message;
        private String path;
        private OffsetDateTime timestamp;
        private List<String> details;

        public ErrorResponseBuilder status(int status) { this.status = status; return this; }
        public ErrorResponseBuilder error(String error) { this.error = error; return this; }
        public ErrorResponseBuilder message(String message) { this.message = message; return this; }
        public ErrorResponseBuilder path(String path) { this.path = path; return this; }
        public ErrorResponseBuilder timestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; return this; }
        public ErrorResponseBuilder details(List<String> details) { this.details = details; return this; }

        public ErrorResponse build() {
            return new ErrorResponse(status, error, message, path, timestamp, details);
        }
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public List<String> getDetails() { return details; }
    public void setDetails(List<String> details) { this.details = details; }
}
