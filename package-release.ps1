<#
.SYNOPSIS
    BuildIntel Release Packaging Script
    Creates a clean, production-ready distribution ZIP archive excluding all local
    secrets, compiled binaries, caches, virtual environments, and IDE artifacts.

.DESCRIPTION
    Packages:
      - Source code (Backend, Frontend, Scrapper)
      - Configuration templates (.env.example, Scrapper/.env.example)
      - Dependency manifests (pom.xml, package.json, package-lock.json, requirements.txt)
      - Docker configurations (Dockerfile, docker-compose.yml, nginx.conf, .dockerignore)
      - Database initialization schema (database/init.sql)
      - Documentation (README.md)
      - Repository configuration (.gitignore, .gitattributes, .editorconfig)
      - Automated test suites (Java tests, Python tests, Angular specs)
    
    Excludes:
      - .env and credentials
      - venv/ and .venv/
      - node_modules/
      - target/ and compiled .class/.jar
      - dist/ and .angular/
      - .metadata/ and .vscode/
      - exports/*.xlsx
      - __pycache__/ and *.pyc
      - *.log

.EXAMPLE
    .\package-release.ps1 -Version "1.0.0"
#>

[CmdletBinding()]
param(
    [string]$Version = "1.0.0",
    [string]$OutputDir = "."
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$zipFileName = "BuildIntel-Release-v$Version.zip"
$zipFilePath = Join-Path $OutputDir $zipFileName

if (Test-Path $zipFilePath) {
    Write-Warning "Archive '$zipFilePath' already exists!"
    $confirmation = Read-Host "Do you want to overwrite '$zipFilePath'? (y/N)"
    if ($confirmation -notmatch "^[yY]$") {
        Write-Host "Packaging aborted to avoid overwriting existing release archive." -ForegroundColor Yellow
        exit 0
    }
    Remove-Item $zipFilePath -Force
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Packaging BuildIntel v$Version Release Archive" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$tempStageDir = Join-Path ([System.IO.Path]::GetTempPath()) ("buildintel_stage_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempStageDir | Out-Null

try {
    Write-Host "[1/5] Collecting tracked & allowable distribution files..." -ForegroundColor Green
    
    # Exclude regex pattern matching build artifacts, local secrets, and IDE metadata
    $excludeRegex = '(^|\\|/)(node_modules|target|\.angular|dist|venv|\.venv|\.metadata|\.vscode|\.git|__pycache__|\.settings)(\\|/|$)|(\.env$|\.env\.(?!example)|.*\.xlsx$|.*\.class$|.*\.jar$|.*\.pyc$|.*\.log$|.*\.zip$|\.classpath$|\.project$|HELP\.md$)'

    $allFiles = Get-ChildItem -Path . -Recurse -File | Where-Object {
        $relPath = Resolve-Path -Path $_.FullName -Relative
        $relPath -notmatch $excludeRegex
    }

    Write-Host "[2/5] Staging $($allFiles.Count) clean source files..." -ForegroundColor Green
    foreach ($file in $allFiles) {
        $rel = $file.FullName.Substring($scriptDir.Length).TrimStart('\', '/')
        $destPath = Join-Path $tempStageDir $rel
        $destDir = Split-Path -Parent $destPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -Path $file.FullName -Destination $destPath -Force
    }

    # Ensure empty exports directory contains .gitkeep
    $stageExportsDir = Join-Path $tempStageDir "exports"
    if (-not (Test-Path $stageExportsDir)) {
        New-Item -ItemType Directory -Path $stageExportsDir -Force | Out-Null
    }
    $stageGitkeep = Join-Path $stageExportsDir ".gitkeep"
    if (-not (Test-Path $stageGitkeep)) {
        New-Item -ItemType File -Path $stageGitkeep -Force | Out-Null
    }

    Write-Host "[3/5] Compressing distribution archive..." -ForegroundColor Green
    Compress-Archive -Path "$tempStageDir\*" -DestinationPath $zipFilePath -CompressionLevel Optimal

    $zipItem = Get-Item $zipFilePath
    $sizeMb = [math]::Round($zipItem.Length / 1MB, 2)
    Write-Host "[4/5] Verifying archive..." -ForegroundColor Green
    Write-Host "   Archive Created : $($zipItem.FullName)" -ForegroundColor White
    Write-Host "   Archive Size    : $sizeMb MB ($($zipItem.Length) bytes)" -ForegroundColor White

    Write-Host "[5/5] Success! Release distribution package is ready." -ForegroundColor Green
}
finally {
    if (Test-Path $tempStageDir) {
        Remove-Item -Path $tempStageDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
