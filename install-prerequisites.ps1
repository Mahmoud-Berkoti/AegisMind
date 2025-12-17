# install-prerequisites.ps1 - Interactive Prerequisites Installer
# Run this script to install everything needed for Cognitive SIEM

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Prompt-Continue {
    param([string]$Message = "Continue?")
    Write-Host ""
    $response = Read-Host "$Message (Y/n)"
    if ($response -eq 'n' -or $response -eq 'N') {
        Write-Host "Skipped." -ForegroundColor Yellow
        return $false
    }
    return $true
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Cognitive SIEM - Prerequisites Installer        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Info "This script will help you install:"
Write-Host "  1. Visual Studio 2022 Build Tools (C++ compiler and CMake)"
Write-Host "  2. vcpkg (C++ package manager)"
Write-Host "  3. Verify Docker Desktop"
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning-Custom "This script should be run as Administrator for best results."
    Write-Info "Right-click PowerShell and select 'Run as Administrator'"
    Write-Host ""
    if (-not (Prompt-Continue "Continue anyway?")) {
        exit 0
    }
}

# Check existing installations
Write-Step "Checking Current Installation Status"

# Git
Write-Host "Checking Git... " -NoNewline
try {
    $gitVersion = git --version
    Write-Success "Installed: $gitVersion"
} catch {
    Write-Warning-Custom "Not installed"
    Write-Info "Please install Git from: https://git-scm.com/download/win"
    exit 1
}

# Docker
Write-Host "Checking Docker... " -NoNewline
try {
    $dockerVersion = docker --version
    Write-Success "Installed: $dockerVersion"
} catch {
    Write-Warning-Custom "Not installed"
    Write-Info "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Visual Studio
Write-Host "Checking Visual Studio 2022... " -NoNewline
$vsPath = "C:\Program Files\Microsoft Visual Studio\2022"
$vsInstalled = Test-Path $vsPath
if ($vsInstalled) {
    Write-Success "Found at $vsPath"
    $needVS = $false
} else {
    Write-Warning-Custom "Not found"
    $needVS = $true
}

# CMake
Write-Host "Checking CMake... " -NoNewline
try {
    $cmakeVersion = cmake --version 2>$null | Select-String "version" | Select-Object -First 1
    Write-Success "Installed: $cmakeVersion"
    $needCMake = $false
} catch {
    Write-Warning-Custom "Not found"
    $needCMake = $true
}

# vcpkg
Write-Host "Checking vcpkg... " -NoNewline
if (Test-Path "C:\vcpkg") {
    Write-Success "Found at C:\vcpkg"
    $needVcpkg = $false
} else {
    Write-Warning-Custom "Not found"
    $needVcpkg = $true
}

Write-Host ""

# Install Visual Studio Build Tools
if ($needVS -or $needCMake) {
    Write-Step "Installing Visual Studio 2022 Build Tools"
    
    Write-Info "Visual Studio Build Tools includes:"
    Write-Host "  • MSVC C++ compiler"
    Write-Host "  • CMake"
    Write-Host "  • Windows SDK"
    Write-Host "  • MSBuild"
    Write-Host ""
    Write-Warning-Custom "This will download ~6 GB and requires ~10 GB disk space"
    Write-Host ""
    
    if (Prompt-Continue "Install Visual Studio Build Tools?") {
        Write-Info "Opening Visual Studio 2022 Build Tools download page..."
        Write-Info "Download link: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022"
        Write-Host ""
        Write-Host "Instructions:" -ForegroundColor Cyan
        Write-Host "1. Click 'Download Build Tools'"
        Write-Host "2. Run the installer"
        Write-Host "3. Select 'Desktop development with C++'"
        Write-Host "4. Click Install"
        Write-Host ""
        
        Start-Process "https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022"
        
        Write-Host ""
        Write-Warning-Custom "After installation completes, press Enter to continue..."
        Read-Host
        
        # Verify installation
        if (Test-Path "C:\Program Files\Microsoft Visual Studio\2022") {
            Write-Success "Visual Studio Build Tools installed successfully!"
        } else {
            Write-Warning-Custom "Installation not detected. Please ensure it completed successfully."
        }
    }
}

# Install vcpkg
if ($needVcpkg) {
    Write-Step "Installing vcpkg"
    
    Write-Info "vcpkg is a C++ package manager that will download and build dependencies."
    Write-Host ""
    
    if (Prompt-Continue "Install vcpkg to C:\vcpkg?") {
        try {
            Write-Info "Cloning vcpkg repository..."
            Push-Location C:\
            git clone https://github.com/Microsoft/vcpkg.git 2>&1 | Out-Null
            
            Write-Info "Bootstrapping vcpkg..."
            cd vcpkg
            .\bootstrap-vcpkg.bat
            
            Write-Info "Setting VCPKG_ROOT environment variable..."
            [Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")
            $env:VCPKG_ROOT = "C:\vcpkg"
            
            Pop-Location
            
            Write-Success "vcpkg installed successfully!"
            Write-Info "VCPKG_ROOT set to: C:\vcpkg"
        } catch {
            Write-Warning-Custom "vcpkg installation failed: $_"
            Write-Info "Manual installation:"
            Write-Host "  cd C:\"
            Write-Host "  git clone https://github.com/Microsoft/vcpkg.git"
            Write-Host "  cd vcpkg"
            Write-Host "  .\bootstrap-vcpkg.bat"
        }
    }
}

# Final Status
Write-Step "Installation Summary"

Write-Host "Current Status:" -ForegroundColor Cyan
Write-Host ""

# Re-check everything
$allGood = $true

Write-Host "Git:              " -NoNewline
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Success "✓ Installed"
} else {
    Write-Warning-Custom "✗ Missing"
    $allGood = $false
}

Write-Host "Docker:           " -NoNewline
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Success "✓ Installed"
} else {
    Write-Warning-Custom "✗ Missing"
    $allGood = $false
}

Write-Host "Visual Studio:    " -NoNewline
if (Test-Path "C:\Program Files\Microsoft Visual Studio\2022") {
    Write-Success "✓ Installed"
} else {
    Write-Warning-Custom "✗ Missing"
    $allGood = $false
}

Write-Host "CMake:            " -NoNewline
if (Get-Command cmake -ErrorAction SilentlyContinue) {
    Write-Success "✓ Installed"
} else {
    Write-Warning-Custom "✗ Missing (restart PowerShell if you just installed VS)"
    $allGood = $false
}

Write-Host "vcpkg:            " -NoNewline
if (Test-Path "C:\vcpkg") {
    Write-Success "✓ Installed"
} else {
    Write-Warning-Custom "✗ Missing"
    $allGood = $false
}

Write-Host ""

if ($allGood) {
    Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   ✓ All Prerequisites Installed!                  ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. CLOSE this PowerShell window" -ForegroundColor Yellow
    Write-Host "2. OPEN a NEW PowerShell window" -ForegroundColor Yellow
    Write-Host "3. Run: cd C:\Users\mberk\Desktop\AegisMind" -ForegroundColor White
    Write-Host "4. Run: .\setup.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║   ⚠ Some Prerequisites Missing                    ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install missing components and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick Links:" -ForegroundColor Cyan
    Write-Host "  • Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022"
    Write-Host "  • Docker Desktop: https://www.docker.com/products/docker-desktop/"
    Write-Host "  • Git: https://git-scm.com/download/win"
    Write-Host ""
}

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  • START_HERE.md - Quick start guide"
Write-Host "  • SETUP_WINDOWS.md - Detailed Windows setup"
Write-Host "  • COMPLETE_SETUP_CHECKLIST.md - Full checklist"
Write-Host ""

