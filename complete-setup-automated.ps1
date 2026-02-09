# Complete Automated Setup and Launch Script
# This script does EVERYTHING - from checking Docker to opening the dashboard

$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host " -> $Message" -ForegroundColor Blue
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   Cognitive SIEM - Complete Automated Setup          " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

# Step 1: Check and start Docker
Write-Step "Step 1: Checking Docker Desktop"

$dockerReady = $false
$maxRetries = 30
$retryCount = 0

Write-Info "Checking if Docker is running..."

while (-not $dockerReady -and $retryCount -lt $maxRetries) {
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Success "Docker is running!"
        } else {
            throw "Docker not ready"
        }
    } catch {
        if ($retryCount -eq 0) {
            Write-Info "Docker not ready, attempting to start Docker Desktop..."
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        }
        
        $retryCount++
        Write-Host "Waiting for Docker Desktop to start... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "ERROR: Docker Desktop did not start in time" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please manually:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop from Start menu"
    Write-Host "2. Wait for whale icon in system tray"
    Write-Host "3. Run this script again"
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 2: Run setup.ps1 to build everything
Write-Step "Step 2: Building the SIEM (This will take ~15 minutes)"

Write-Info "Starting MongoDB and building project..."
Write-Info "This includes:"
Write-Host "  • Starting MongoDB with replica set"
Write-Host "  • Downloading C++ dependencies via vcpkg"
Write-Host "  • Compiling the SIEM (C++20 code)"
Write-Host "  • Running unit tests"
Write-Host ""
Write-Host "Grab a coffee ☕ - this will take about 15 minutes..." -ForegroundColor Yellow
Write-Host ""

& ".\setup.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Write-Host "Check the output above for errors." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Success "Build completed successfully!"
Write-Host ""

# Step 3: Verify build artifacts
Write-Step "Step 3: Verifying Build"

if (-not (Test-Path ".\build\Release\siemd.exe")) {
    Write-Host "ERROR: siemd.exe not found!" -ForegroundColor Red
    Write-Host "Expected location: .\build\Release\siemd.exe" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".\build\Release\seed_demo_data.exe")) {
    Write-Host "ERROR: seed_demo_data.exe not found!" -ForegroundColor Red
    exit 1
}

Write-Success "All binaries found!"
Write-Host ""

# Step 4: Start the SIEM server in background
Write-Step "Step 4: Starting SIEM Server"

Write-Info "Launching SIEM server on ports 8080 (REST) and 8081 (WebSocket)..."

$siemProcess = Start-Process -FilePath ".\build\Release\siemd.exe" `
    -ArgumentList "--config", ".\config\app.yaml" `
    -PassThru `
    -WindowStyle Normal

Write-Success "SIEM server started (PID: $($siemProcess.Id))"
Write-Info "Waiting for server to be ready..."
Start-Sleep -Seconds 5

# Check if server is responding
$serverReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if ($serverReady) {
    Write-Success "SIEM server is ready!"
} else {
    Write-Host "WARNING: Server may still be starting up..." -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Seed demo data
Write-Step "Step 5: Seeding Demo Data"

Write-Info "Creating sample incidents (SSH brute force, auth failures, anomalies)..."
Write-Host ""

Start-Process -FilePath ".\build\Release\seed_demo_data.exe" -Wait -NoNewWindow

Write-Success "Demo data seeded!"
Write-Host ""

# Step 6: Open the dashboard
Write-Step "Step 6: Opening Dashboard"

Write-Info "Launching web dashboard..."
Start-Sleep -Seconds 2

Start-Process "ui\static\index.html"

Write-Success "Dashboard opened in your default browser!"
Write-Host ""

# Final summary
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   SIEM is Running Successfully!                       " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "  - MongoDB:        mongodb://localhost:27017/?replicaSet=rs0" -ForegroundColor White
Write-Host "  - SIEM Server:    http://localhost:8080 (REST)" -ForegroundColor White
Write-Host "  - WebSocket:      ws://localhost:8081/stream" -ForegroundColor White
Write-Host "  - Dashboard:      Opened in browser" -ForegroundColor White
Write-Host ""
Write-Host "What you should see:" -ForegroundColor Cyan
Write-Host "  [OK] Live incidents updating in real-time" -ForegroundColor Green
Write-Host "  [OK] SSH brute force attempts" -ForegroundColor Green
Write-Host "  [OK] Failed authentication events" -ForegroundColor Green
Write-Host "  [OK] Anomalous traffic detection" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  Test API:        curl http://localhost:8080/health" -ForegroundColor Gray
Write-Host "  View MongoDB:    docker exec siem-mongodb mongosh cog_siem" -ForegroundColor Gray
Write-Host "  View logs:       Get-Content logs\siem.log -Wait" -ForegroundColor Gray
Write-Host "  Stop MongoDB:    docker stop siem-mongodb" -ForegroundColor Gray
Write-Host ""
Write-Host "SIEM Server Process ID: $($siemProcess.Id)" -ForegroundColor Gray
Write-Host "To stop the SIEM server, close its window or run: Stop-Process -Id $($siemProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Enjoy your Cognitive SIEM!" -ForegroundColor Green
Write-Host ""

