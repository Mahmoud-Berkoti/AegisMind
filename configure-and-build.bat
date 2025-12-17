@echo off
echo ========================================
echo Configuring and Building Cognitive SIEM
echo ========================================
echo.

REM Set up Visual Studio 2019 environment
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvars64.bat"

echo.
echo Step 1: Configuring with CMake for Visual Studio 2019...
cd /d "%~dp0"

cmake -S . -B build ^
  -G "Visual Studio 16 2019" ^
  -A x64 ^
  -DCMAKE_TOOLCHAIN_FILE=C:\vcpkg\scripts\buildsystems\vcpkg.cmake ^
  -DCMAKE_BUILD_TYPE=Release

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: CMake configuration failed!
    exit /b 1
)

echo.
echo Step 2: Building the project...
cmake --build build --config Release -j

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Binaries in: %~dp0build\Release\
echo.
echo Next steps:
echo   1. Start SIEM: .\build\Release\siemd.exe --config .\config\app.yaml
echo   2. Seed data: .\build\Release\seed_demo_data.exe
echo   3. Open UI: start ui\static\index.html
echo.

