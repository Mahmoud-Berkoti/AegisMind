@echo off
setlocal

echo === Cognitive SIEM Build Script ===
echo.

REM Check for vcpkg
if "%VCPKG_ROOT%"=="" (
    echo Error: VCPKG_ROOT environment variable not set
    echo Please install vcpkg and set VCPKG_ROOT
    echo Example: set VCPKG_ROOT=C:\path\to\vcpkg
    exit /b 1
)

echo Using vcpkg at: %VCPKG_ROOT%
echo.

REM Build type
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=Release

echo Build type: %BUILD_TYPE%
echo.

REM Create build directory
echo Creating build directory...
if not exist build mkdir build

REM Configure
echo Configuring CMake...
cmake -S . -B build ^
    -DCMAKE_TOOLCHAIN_FILE="%VCPKG_ROOT%\scripts\buildsystems\vcpkg.cmake" ^
    -DCMAKE_BUILD_TYPE=%BUILD_TYPE% ^
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

if %errorlevel% neq 0 exit /b %errorlevel%

REM Build
echo.
echo Building...
cmake --build build --config %BUILD_TYPE% -j

if %errorlevel% neq 0 exit /b %errorlevel%

REM Run tests
echo.
echo Running tests...
cd build
ctest -C %BUILD_TYPE% --output-on-failure
cd ..

echo.
echo === Build completed successfully! ===
echo Binaries are in: build\%BUILD_TYPE%
echo.
echo To run the SIEM:
echo   build\%BUILD_TYPE%\siemd.exe --config config\app.yaml
echo.
echo To seed demo data:
echo   build\%BUILD_TYPE%\seed_demo_data.exe

endlocal

