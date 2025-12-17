# Simple Prerequisites Installer for Cognitive SIEM
# Run with: .\install-prereqs-simple.ps1

Write-Host ""
Write-Host "=== Cognitive SIEM - Prerequisites Installer ===" -ForegroundColor Green
Write-Host ""

# Check Git
Write-Host "Checking Git... " -NoNewline
try {
    $null = git --version 2>&1
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "MISSING" -ForegroundColor Red
    Write-Host "Install from: https://git-scm.com/download/win"
    exit 1
}

# Check Docker
Write-Host "Checking Docker... " -NoNewline
try {
    $null = docker --version 2>&1
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "MISSING" -ForegroundColor Red
    Write-Host "Install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Check Visual Studio
Write-Host "Checking Visual Studio 2022... " -NoNewline
if (Test-Path "C:\Program Files\Microsoft Visual Studio\2022") {
    Write-Host "OK" -ForegroundColor Green
    $vsInstalled = $true
} else {
    Write-Host "NOT FOUND" -ForegroundColor Yellow
    $vsInstalled = $false
}

# Check CMake
Write-Host "Checking CMake... " -NoNewline
try {
    $null = cmake --version 2>&1
    Write-Host "OK" -ForegroundColor Green
    $cmakeInstalled = $true
} catch {
    Write-Host "NOT FOUND" -ForegroundColor Yellow
    $cmakeInstalled = $false
}

# Check vcpkg
Write-Host "Checking vcpkg... " -NoNewline
if (Test-Path "C:\vcpkg") {
    Write-Host "OK" -ForegroundColor Green
    $vcpkgInstalled = $true
} else {
    Write-Host "NOT FOUND" -ForegroundColor Yellow
    $vcpkgInstalled = $false
}

Write-Host ""

# Install what's missing
if (-not $vsInstalled) {
    Write-Host "=== Visual Studio 2022 Build Tools Required ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening download page..."
    Start-Process "https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022"
    Write-Host ""
    Write-Host "Instructions:" -ForegroundColor Yellow
    Write-Host "1. Download 'Build Tools for Visual Studio 2022'"
    Write-Host "2. Run the installer"
    Write-Host "3. Select 'Desktop development with C++'"
    Write-Host "4. Click Install (about 6 GB download)"
    Write-Host ""
    Write-Host "Press Enter after installation completes..." -ForegroundColor Yellow
    Read-Host
}

if (-not $vcpkgInstalled) {
    Write-Host "=== Installing vcpkg ===" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        Write-Host "Cloning vcpkg to C:\vcpkg..."
        Push-Location C:\
        git clone https://github.com/Microsoft/vcpkg.git 2>&1 | Out-Null
        
        Write-Host "Bootstrapping vcpkg..."
        Set-Location vcpkg
        .\bootstrap-vcpkg.bat | Out-Null
        
        Write-Host "Setting environment variable..."
        [Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")
        $env:VCPKG_ROOT = "C:\vcpkg"
        
        Pop-Location
        Write-Host "vcpkg installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error installing vcpkg: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Manual installation:" -ForegroundColor Yellow
        Write-Host "cd C:\"
        Write-Host "git clone https://github.com/Microsoft/vcpkg.git"
        Write-Host "cd vcpkg"
        Write-Host ".\bootstrap-vcpkg.bat"
        Write-Host "[Environment]::SetEnvironmentVariable('VCPKG_ROOT', 'C:\vcpkg', 'User')"
        exit 1
    }
}

# Final check
Write-Host ""
Write-Host "=== Final Status ===" -ForegroundColor Green
Write-Host ""

$ready = $true

if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Git" -ForegroundColor Green
} else {
    Write-Host "[  ] Git" -ForegroundColor Red
    $ready = $false
}

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Docker" -ForegroundColor Green
} else {
    Write-Host "[  ] Docker" -ForegroundColor Red
    $ready = $false
}

if (Test-Path "C:\Program Files\Microsoft Visual Studio\2022") {
    Write-Host "[OK] Visual Studio" -ForegroundColor Green
} else {
    Write-Host "[  ] Visual Studio" -ForegroundColor Red
    $ready = $false
}

if (Get-Command cmake -ErrorAction SilentlyContinue) {
    Write-Host "[OK] CMake" -ForegroundColor Green
} else {
    Write-Host "[  ] CMake (restart PowerShell if just installed)" -ForegroundColor Yellow
}

if (Test-Path "C:\vcpkg") {
    Write-Host "[OK] vcpkg" -ForegroundColor Green
} else {
    Write-Host "[  ] vcpkg" -ForegroundColor Red
    $ready = $false
}

Write-Host ""

if ($ready) {
    Write-Host "=== Ready to Build! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. CLOSE this PowerShell window"
    Write-Host "2. OPEN a NEW PowerShell window"
    Write-Host "3. cd C:\Users\mberk\Desktop\AegisMind"
    Write-Host "4. .\setup.ps1"
    Write-Host ""
} else {
    Write-Host "=== Some items missing ===" -ForegroundColor Yellow
    Write-Host "Please install missing components and try again."
    Write-Host ""
}

