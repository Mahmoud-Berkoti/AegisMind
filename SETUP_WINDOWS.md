# Windows Setup Guide for Cognitive SIEM

## Prerequisites Installation

### 1. Install Visual Studio 2022 (if not already installed)

Download and install **Visual Studio 2022 Community Edition**:
- URL: https://visualstudio.microsoft.com/downloads/
- During installation, select **"Desktop development with C++"** workload
- This includes:
  - MSVC compiler
  - CMake
  - Windows SDK

### 2. Install vcpkg

Open **PowerShell as Administrator** and run:

```powershell
# Navigate to a suitable location (e.g., C:\)
cd C:\

# Clone vcpkg
git clone https://github.com/Microsoft/vcpkg.git

# Bootstrap vcpkg
cd vcpkg
.\bootstrap-vcpkg.bat

# Add to PATH (optional but recommended)
[Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")

# Verify installation
.\vcpkg.exe --version
```

**Close and reopen PowerShell** for the environment variable to take effect.

### 3. Install Docker Desktop

1. Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Ensure it's running (whale icon in system tray)

## Building the SIEM

### Step 1: Start MongoDB

**Option A - Using the Windows batch script:**
```powershell
.\scripts\start-mongodb-windows.bat
```

**Option B - Manual Docker command:**
```powershell
# Start MongoDB with replica set
docker run -d --name siem-mongodb -p 27017:27017 mongo:7 --replSet rs0

# Wait 10 seconds for MongoDB to start
Start-Sleep -Seconds 10

# Initialize replica set
docker exec siem-mongodb mongosh --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

Verify MongoDB is running:
```powershell
docker ps
docker exec siem-mongodb mongosh --eval "rs.status()"
```

### Step 2: Build the Project

```powershell
# Ensure you're in the project directory
cd C:\Users\mberk\Desktop\AegisMind

# Configure with CMake
cmake -S . -B build `
  -DCMAKE_TOOLCHAIN_FILE="$env:VCPKG_ROOT\scripts\buildsystems\vcpkg.cmake" `
  -DCMAKE_BUILD_TYPE=Release

# Build (this will take 10-15 minutes the first time as vcpkg downloads and builds dependencies)
cmake --build build --config Release -j
```

### Step 3: Run Tests

```powershell
cd build
ctest -C Release --output-on-failure
cd ..
```

### Step 4: Start the SIEM

```powershell
.\build\Release\siemd.exe --config .\config\app.yaml
```

You should see:
```json
{"msg":"siem_ready","rest_port":8080,"ws_port":8081}
```

### Step 5: Seed Demo Data

In a **new PowerShell window**:
```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\seed_demo_data.exe
```

### Step 6: Open the Dashboard

**Option A - Direct file access:**
```powershell
start ui\static\index.html
```

**Option B - With local server:**
```powershell
# Using Python
python -m http.server 8000 --directory ui/static

# Or using Node.js
npx serve ui/static -p 8000
```

Then open: http://localhost:8000

## Quick Start Script

Here's a complete setup script (save as `setup.ps1`):

```powershell
# setup.ps1 - Complete setup script for Cognitive SIEM

Write-Host "=== Cognitive SIEM Setup ===" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check vcpkg
if (-not $env:VCPKG_ROOT) {
    Write-Host "ERROR: VCPKG_ROOT not set" -ForegroundColor Red
    Write-Host "Please install vcpkg first:"
    Write-Host "  1. git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg"
    Write-Host "  2. cd C:\vcpkg"
    Write-Host "  3. .\bootstrap-vcpkg.bat"
    Write-Host "  4. Set VCPKG_ROOT environment variable"
    Write-Host "  5. Restart PowerShell"
    exit 1
}

Write-Host "✓ vcpkg found at: $env:VCPKG_ROOT" -ForegroundColor Green

# Check Docker
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker Desktop is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again"
    exit 1
}

# Start MongoDB
Write-Host ""
Write-Host "Starting MongoDB..." -ForegroundColor Yellow
docker run -d --name siem-mongodb -p 27017:27017 mongo:7 --replSet rs0 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    docker start siem-mongodb 2>&1 | Out-Null
}

Start-Sleep -Seconds 10

docker exec siem-mongodb mongosh --quiet --eval "try { rs.status(); } catch(e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]}); }"
Write-Host "✓ MongoDB running" -ForegroundColor Green

# Build
Write-Host ""
Write-Host "Building project (this may take 10-15 minutes the first time)..." -ForegroundColor Yellow

cmake -S . -B build `
  -DCMAKE_TOOLCHAIN_FILE="$env:VCPKG_ROOT\scripts\buildsystems\vcpkg.cmake" `
  -DCMAKE_BUILD_TYPE=Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: CMake configuration failed" -ForegroundColor Red
    exit 1
}

cmake --build build --config Release -j

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build complete" -ForegroundColor Green

# Run tests
Write-Host ""
Write-Host "Running tests..." -ForegroundColor Yellow
cd build
ctest -C Release --output-on-failure
cd ..
Write-Host "✓ Tests passed" -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start the SIEM:" -ForegroundColor Cyan
Write-Host "  .\build\Release\siemd.exe --config .\config\app.yaml"
Write-Host ""
Write-Host "To seed demo data:" -ForegroundColor Cyan
Write-Host "  .\build\Release\seed_demo_data.exe"
Write-Host ""
Write-Host "To open dashboard:" -ForegroundColor Cyan
Write-Host "  start ui\static\index.html"
Write-Host ""
```

## Troubleshooting

### vcpkg Issues

**"vcpkg not found"**
```powershell
# Install vcpkg
git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
cd C:\vcpkg
.\bootstrap-vcpkg.bat

# Set environment variable
[Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")

# Restart PowerShell
```

**"Package installation failed"**
```powershell
# Update vcpkg
cd $env:VCPKG_ROOT
git pull
.\vcpkg.exe update
```

### MongoDB Issues

**"Docker Desktop is not running"**
- Open Docker Desktop from Start menu
- Wait for the whale icon to appear in system tray
- Try again

**"Replica set not initialized"**
```powershell
docker exec siem-mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

**"Port 27017 already in use"**
```powershell
# Stop existing MongoDB
net stop MongoDB

# Or change port in config/app.yaml
```

### Build Issues

**"CMake not found"**
- Install Visual Studio 2022 with "Desktop development with C++"
- Or install CMake separately: https://cmake.org/download/

**"Compiler not found"**
- Open "x64 Native Tools Command Prompt for VS 2022"
- Run the build commands from there

**"Out of memory during build"**
```powershell
# Build with fewer parallel jobs
cmake --build build --config Release -j 2
```

### Runtime Issues

**"MongoDB connection failed"**
```powershell
# Check MongoDB is running
docker ps | Select-String mongo

# Check replica set status
docker exec siem-mongodb mongosh --eval "rs.status()"
```

**"Port 8080 or 8081 already in use"**
- Change ports in `config/app.yaml`
- Or stop the conflicting service

## Next Steps

Once everything is running:

1. **Monitor logs**: Check `logs/siem.log`
2. **Test API**: `curl http://localhost:8080/health`
3. **Watch dashboard**: Open `ui/static/index.html`
4. **Explore data**: `docker exec siem-mongodb mongosh cog_siem`

## Additional Resources

- Full documentation: [README.md](README.md)
- Quick reference: [QUICKSTART.md](QUICKSTART.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

