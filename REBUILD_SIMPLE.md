# Simple Rebuild Instructions

The source code has been fixed. Here's how to rebuild:

## Option 1: Use Developer Command Prompt (Easiest)

1. Open **Start Menu**
2. Search for "**Developer Command Prompt for VS 2019**" or "**x64 Native Tools Command Prompt**"
3. Open it
4. Run these commands:

```cmd
cd C:\Users\mberk\Desktop\AegisMind
cd build
msbuild siem_core.vcxproj /p:Configuration=Release /v:minimal
msbuild siemd.vcxproj /p:Configuration=Release /v:minimal
```

5. Done! The fixed `.exe` is ready.

## Option 2: Full Rebuild (if Option 1 fails)

In the Developer Command Prompt:

```cmd
cd C:\Users\mberk\Desktop\AegisMind
rmdir /s /q build
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=C:\vcpkg\scripts\buildsystems\vcpkg.cmake -G "Visual Studio 16 2019"
cmake --build build --config Release
```

## Then Run It

```powershell
.\build\Release\siemd.exe --config .\config\app.yaml
```

The TTL error should be gone!

