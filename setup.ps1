# setup.ps1 - Complete setup script for Cognitive SIEM on Windows
# Run this script to set up and build the entire project

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Cognitive SIEM - Setup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check vcpkg
if (-not $env:VCPKG_ROOT) {
    Write-Error-Custom "VCPKG_ROOT environment variable not set"
    Write-Host ""
    Write-Host "Please install vcpkg first:" -ForegroundColor Yellow
    Write-Host "  1. Open PowerShell as Administrator"
    Write-Host "  2. Run: git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg"
    Write-Host "  3. Run: cd C:\vcpkg"
    Write-Host "  4. Run: .\bootstrap-vcpkg.bat"
    Write-Host "  5. Run: [Environment]::SetEnvironmentVariable('VCPKG_ROOT', 'C:\vcpkg', 'User')"
    Write-Host "  6. Restart PowerShell and run this script again"
    Write-Host ""
    exit 1
}

if (-not (Test-Path $env:VCPKG_ROOT)) {
    Write-Error-Custom "VCPKG_ROOT points to non-existent directory: $env:VCPKG_ROOT"
    exit 1
}

Write-Success "vcpkg found at: $env:VCPKG_ROOT"

# Check CMake
try {
    $cmakeVersion = cmake --version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Success "CMake is installed: $cmakeVersion"
} catch {
    Write-Error-Custom "CMake not found"
    Write-Host "Please install Visual Studio 2022 with 'Desktop development with C++'" -ForegroundColor Yellow
    Write-Host "Or download CMake from: https://cmake.org/download/" -ForegroundColor Yellow
    exit 1
}

# Check Docker
Write-Step "Checking Docker..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed: $dockerVersion"
    
    docker ps | Out-Null
    Write-Success "Docker daemon is running"
} catch {
    Write-Error-Custom "Docker Desktop is not running"
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Start Docker Desktop from the Start menu"
    Write-Host "  2. Wait for the whale icon to appear in the system tray"
    Write-Host "  3. Run this script again"
    Write-Host ""
    exit 1
}

# Start MongoDB
Write-Step "Setting up MongoDB..."

$mongoExists = docker ps -a --filter "name=siem-mongodb" --format "{{.Names}}" 2>$null
if ($mongoExists -eq "siem-mongodb") {
    Write-Host "MongoDB container already exists, starting it..."
    docker start siem-mongodb 2>&1 | Out-Null
} else {
    Write-Host "Creating MongoDB container with replica set..."
    docker run -d --name siem-mongodb -p 27017:27017 mongo:7 --replSet rs0 2>&1 | Out-Null
}

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to start MongoDB"
    exit 1
}

Write-Host "Waiting for MongoDB to be ready..."
Start-Sleep -Seconds 10

Write-Host "Initializing replica set..."
$initResult = docker exec siem-mongodb mongosh --quiet --eval "try { rs.status(); print('Replica set already initialized'); } catch(e) { print('Initializing replica set...'); rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]}); print('Replica set initialized successfully'); }" 2>&1

Write-Host $initResult
Write-Success "MongoDB is running on port 27017"

# Build the project
Write-Step "Configuring project with CMake..."
Write-Host "This will download and build all dependencies via vcpkg." -ForegroundColor Yellow
Write-Host "First-time build may take 10-15 minutes..." -ForegroundColor Yellow
Write-Host ""

cmake -S . -B build `
    -DCMAKE_TOOLCHAIN_FILE="$env:VCPKG_ROOT\scripts\buildsystems\vcpkg.cmake" `
    -DCMAKE_BUILD_TYPE=Release `
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "CMake configuration failed"
    exit 1
}

Write-Success "CMake configuration complete"

Write-Step "Building project..."
cmake --build build --config Release -j

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Build failed"
    Write-Host ""
    Write-Host "If you see errors about missing packages, try:" -ForegroundColor Yellow
    Write-Host "  cd $env:VCPKG_ROOT"
    Write-Host "  git pull"
    Write-Host "  .\vcpkg.exe update"
    Write-Host ""
    exit 1
}

Write-Success "Build complete"

# Run tests
Write-Step "Running tests..."
Push-Location build
$testResult = ctest -C Release --output-on-failure 2>&1
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Success "All tests passed"
} else {
    Write-Host "Some tests failed:" -ForegroundColor Yellow
    Write-Host $testResult
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "MongoDB is running on: mongodb://localhost:27017/?replicaSet=rs0" -ForegroundColor Cyan
Write-Host "Binaries are in: build\Release\" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the SIEM:" -ForegroundColor White
Write-Host "   .\build\Release\siemd.exe --config .\config\app.yaml" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In another terminal, seed demo data:" -ForegroundColor White
Write-Host "   .\build\Release\seed_demo_data.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open the dashboard:" -ForegroundColor White
Write-Host "   start ui\static\index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test the API:" -ForegroundColor White
Write-Host "   curl http://localhost:8080/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  docker logs -f siem-mongodb     # View MongoDB logs" -ForegroundColor Gray
Write-Host "  docker stop siem-mongodb        # Stop MongoDB" -ForegroundColor Gray
Write-Host "  docker start siem-mongodb       # Start MongoDB" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  README.md          # Complete documentation" -ForegroundColor Gray
Write-Host "  QUICKSTART.md      # Quick reference" -ForegroundColor Gray
Write-Host "  SETUP_WINDOWS.md   # Windows-specific setup" -ForegroundColor Gray
Write-Host ""

