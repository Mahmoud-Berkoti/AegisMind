# Automatic Visual Studio Build Tools Downloader and Installer

Write-Host ""
Write-Host "=== Downloading Visual Studio Build Tools ===" -ForegroundColor Green
Write-Host ""

$installerPath = "$env:TEMP\vs_BuildTools.exe"
$downloadUrl = "https://aka.ms/vs/17/release/vs_BuildTools.exe"

Write-Host "Download URL: $downloadUrl" -ForegroundColor Cyan
Write-Host "Saving to: $installerPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Downloading (about 3 MB)..." -ForegroundColor Yellow
Write-Host ""

try {
    # Download with progress
    Import-Module BitsTransfer -ErrorAction SilentlyContinue
    
    if (Get-Command Start-BitsTransfer -ErrorAction SilentlyContinue) {
        Start-BitsTransfer -Source $downloadUrl -Destination $installerPath -Description "Downloading VS Build Tools"
    } else {
        # Fallback to Invoke-WebRequest
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    }
    
    Write-Host "Download complete!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "Error downloading: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative download method..." -ForegroundColor Yellow
    
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($downloadUrl, $installerPath)
        Write-Host "Download complete!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "Download failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please download manually from:" -ForegroundColor Yellow
        Write-Host "https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022"
        exit 1
    }
}

# Verify download
if (-not (Test-Path $installerPath)) {
    Write-Host "Installer not found after download!" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $installerPath).Length / 1MB
Write-Host "Downloaded: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
Write-Host ""

# Launch the installer
Write-Host "=== Launching Installer ===" -ForegroundColor Green
Write-Host ""
Write-Host "The Visual Studio Installer will open in passive mode." -ForegroundColor Cyan
Write-Host "It will automatically install 'Desktop development with C++'" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  • Download about 6 GB" -ForegroundColor White
Write-Host "  • Take 10-15 minutes" -ForegroundColor White
Write-Host "  • Install C++ compiler, CMake, and Windows SDK" -ForegroundColor White
Write-Host ""
Write-Host "Starting installation..." -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

# Launch installer with C++ workload
$arguments = @(
    "--add", "Microsoft.VisualStudio.Workload.VCTools",
    "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
    "--add", "Microsoft.VisualStudio.Component.Windows11SDK.22000",
    "--add", "Microsoft.VisualStudio.Component.VC.CMake.Project",
    "--passive",
    "--norestart",
    "--wait"
)

Write-Host "Running: vs_BuildTools.exe with C++ workload..." -ForegroundColor Cyan
$process = Start-Process -FilePath $installerPath -ArgumentList $arguments -PassThru

Write-Host ""
Write-Host "Installation started (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting for installation to complete..." -ForegroundColor Yellow
Write-Host "You can monitor progress in the Visual Studio Installer window." -ForegroundColor Gray
Write-Host ""

# Wait for process
$process.WaitForExit()
$exitCode = $process.ExitCode

Write-Host ""
if ($exitCode -eq 0 -or $exitCode -eq 3010) {
    Write-Host "Installation completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    if ($exitCode -eq 3010) {
        Write-Host "Note: A restart may be required, but you can continue for now." -ForegroundColor Yellow
        Write-Host ""
    }
    
    # Clean up
    Write-Host "Cleaning up..." -ForegroundColor Gray
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "=== Installation Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. CLOSE this PowerShell window" -ForegroundColor Yellow
    Write-Host "2. OPEN a NEW PowerShell window" -ForegroundColor Yellow
    Write-Host "3. cd C:\Users\mberk\Desktop\AegisMind" -ForegroundColor White
    Write-Host "4. .\setup.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "See POST_INSTALL_STEPS.md for details." -ForegroundColor Gray
    Write-Host ""
    
} elseif ($exitCode -eq 5007) {
    Write-Host "Installation cancelled by user." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Installation exited with code: $exitCode" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common exit codes:" -ForegroundColor Gray
    Write-Host "  0    = Success" -ForegroundColor Gray
    Write-Host "  3010 = Success (restart required)" -ForegroundColor Gray
    Write-Host "  5007 = Cancelled by user" -ForegroundColor Gray
    Write-Host ""
    Write-Host "If installation failed, you can:" -ForegroundColor Cyan
    Write-Host "  1. Run this script again: .\download-vs-buildtools.ps1" -ForegroundColor White
    Write-Host "  2. Or manually download from:" -ForegroundColor White
    Write-Host "     https://visualstudio.microsoft.com/downloads/" -ForegroundColor Gray
    Write-Host ""
}
