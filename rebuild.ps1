# Quick rebuild script

Write-Host "Rebuilding SIEM with fixed MongoDB configuration..." -ForegroundColor Cyan

# Find Visual Studio installation
$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vsWhere) {
    $vsPath = & $vsWhere -latest -property installationPath
    $vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"
    
    if (Test-Path $vcvarsPath) {
        Write-Host "Using Visual Studio at: $vsPath" -ForegroundColor Gray
        
        # Create a batch file to run vcvars and cmake
        $batchContent = @"
@echo off
call "$vcvarsPath"
cd /d "$PWD"
cmake --build build --config Release --target siemd
"@
        
        $batchFile = "$env:TEMP\rebuild_siem.bat"
        $batchContent | Out-File -FilePath $batchFile -Encoding ASCII
        
        # Run the batch file
        & cmd /c $batchFile
        
        Remove-Item $batchFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Rebuild successful!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Rebuild failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }
} else {
    Write-Host "Visual Studio not found via vswhere, trying MSBuild directly..." -ForegroundColor Yellow
    
    # Try MSBuild directly
    $msbuild = "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
    if (Test-Path $msbuild) {
        & $msbuild "build\CognitiveSIEM.sln" /p:Configuration=Release /t:siemd
    } else {
        Write-Host "Could not find build tools. Please run setup.ps1 again." -ForegroundColor Red
        exit 1
    }
}

