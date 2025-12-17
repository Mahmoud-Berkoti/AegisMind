@echo off
echo ========================================
echo Rebuilding Cognitive SIEM...
echo ========================================
echo.

REM Set up Visual Studio environment
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvars64.bat"

echo.
echo Building siem_core library...
cd /d "%~dp0build"
msbuild siem_core.vcxproj /p:Configuration=Release /p:Platform=x64 /v:minimal /nologo

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: siem_core build failed!
    exit /b 1
)

echo.
echo Building siemd executable...
msbuild siemd.vcxproj /p:Configuration=Release /p:Platform=x64 /v:minimal /nologo

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: siemd build failed!
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Executable: %~dp0build\Release\siemd.exe
echo.

