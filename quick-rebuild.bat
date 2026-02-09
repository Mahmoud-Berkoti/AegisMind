@echo off
echo Rebuilding siemd.exe with fixed MongoDB configuration...
echo.

cd /d "%~dp0"

REM Find MSBuild
set MSBUILD="C:\Program Files\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
if not exist %MSBUILD% (
    set MSBUILD="C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe"
)

if not exist %MSBUILD% (
    echo MSBuild not found!
    exit /b 1
)

REM Build just the core library and main executable
%MSBUILD% build\siem_core.vcxproj /p:Configuration=Release /v:minimal
%MSBUILD% build\siemd.vcxproj /p:Configuration=Release /v:minimal

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build successful!
    echo.
    echo You can now run: .\build\Release\siemd.exe --config .\config\app.yaml
) else (
    echo.
    echo Build failed!
)

