# Post-Installation Steps

## After Installing Visual Studio Build Tools

Once Visual Studio Build Tools installation completes:

### 1. Close ALL PowerShell windows

This is important for environment variables to refresh.

### 2. Open a NEW PowerShell window

### 3. Navigate to the project

```powershell
cd C:\Users\mberk\Desktop\AegisMind
```

### 4. Verify installation

```powershell
# Check CMake (should work now)
cmake --version

# Check vcpkg
echo $env:VCPKG_ROOT
# Should show: C:\vcpkg
```

### 5. Start Docker Desktop

- Open Docker Desktop from Start menu
- Wait for the whale icon in system tray

### 6. Run the setup script

```powershell
.\setup.ps1
```

This will:
- Start MongoDB with replica set
- Download and build all C++ dependencies (~10-15 minutes)
- Compile the SIEM
- Run tests

### 7. Start the SIEM (after build completes)

**Terminal 1:**
```powershell
.\build\Release\siemd.exe --config .\config\app.yaml
```

Wait for: `{"msg":"siem_ready","rest_port":8080,"ws_port":8081}`

**Terminal 2 (new window):**
```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\seed_demo_data.exe
```

**Open Dashboard:**
```powershell
start ui\static\index.html
```

## Expected Timeline

| Step | Time | What's Happening |
|------|------|------------------|
| VS Build Tools Install | 10-15 min | Downloading and installing compiler |
| First-time vcpkg build | 10-15 min | Building MongoDB driver, Boost, etc. |
| Compile SIEM | 2-3 min | Building your project |
| **Total** | **~25-30 min** | First time only! |

## What You'll See When Done

1. **SIEM Console**: JSON logs flowing
2. **Demo Data**: Creating SSH brute force, auth failures
3. **Dashboard**: Live incidents appearing in real-time!
4. **MongoDB**: Running in Docker container

## Troubleshooting

### "CMake not found" after VS install
- Close ALL PowerShell windows
- Open new PowerShell
- Try again

### "Docker not running"
- Open Docker Desktop
- Wait for whale icon
- Try again

### Build errors
- Make sure $env:VCPKG_ROOT is set: `echo $env:VCPKG_ROOT`
- Should show: C:\vcpkg
- If not: `$env:VCPKG_ROOT = "C:\vcpkg"`

## Quick Reference

```powershell
# Start MongoDB
docker start siem-mongodb

# Stop MongoDB
docker stop siem-mongodb

# View MongoDB
docker exec siem-mongodb mongosh cog_siem --eval "db.incidents.find().pretty()"

# View logs
Get-Content logs\siem.log -Wait

# Test API
curl http://localhost:8080/health
```

## You're Almost There!

Once Visual Studio Build Tools finishes installing:
1. Close PowerShell
2. Open new PowerShell
3. Run: `.\setup.ps1`
4. Grab coffee ☕ (wait ~15 min)
5. Start SIEM and enjoy! 🎉

