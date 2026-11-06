# ==============================================================================
# BuildIntel Backend Dockerfile
# Multi-stage build providing Java 25 runtime and Python 3 scraper environment
# Build Context: Project Root (e.g. docker build -f Backend/Dockerfile .)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Spring Boot JAR using Maven and Java 25
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-25 AS builder
WORKDIR /workspace

# Pre-fetch Maven dependencies for caching
COPY Backend/pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source tree and package executable jar
COPY Backend/src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Runtime Image with Java 25 + Python 3 Scraper Subprocess Support
# ------------------------------------------------------------------------------
FROM eclipse-temurin:25-jre
WORKDIR /app

# Install Python 3, venv, and curl (for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create isolated Python virtual environment inside container
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python requirements
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy Scrapper code tree and ensure exports directory exists
COPY Scrapper/ /app/Scrapper/
RUN mkdir -p /app/exports

# Copy built Spring Boot executable artifact from builder stage
COPY --from=builder /workspace/target/*.jar /app/app.jar

# Production runtime defaults
ENV SERVER_PORT=8080 \
    DB_HOST=postgres \
    DB_PORT=5432 \
    DB_NAME=buildintel_db \
    DB_USER=postgres \
    PYTHON_EXECUTABLE=/app/venv/bin/python \
    SCRAPER_SCRIPT_PATH=/app/Scrapper/scraper.py \
    EXPORT_SCRIPT_PATH=/app/Scrapper/export_excel.py \
    EXPORTS_DIR=/app/exports \
    PYTHONUNBUFFERED=1

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/api/dashboard/stats || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

