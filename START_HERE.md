# 🚀 START HERE - Complete Setup in 5 Steps

## Prerequisites (One-Time Setup)

### 1. Install vcpkg (5 minutes)

Open **PowerShell as Administrator** and run:

```powershell
# Clone vcpkg to C:\vcpkg
cd C:\
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
.\bootstrap-vcpkg.bat

# Set environment variable
[Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")
```

**Close PowerShell and open a NEW PowerShell window** for the change to take effect.

### 2. Start Docker Desktop

- Open **Docker Desktop** from the Start menu
- Wait for it to fully start (whale icon appears in system tray)

## Automated Setup

Once prerequisites are done, run the automated setup script:

```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\setup.ps1
```

This will:
- ✅ Check all prerequisites
- ✅ Start MongoDB with replica set
- ✅ Download and build all dependencies (~10-15 min first time)
- ✅ Compile the SIEM
- ✅ Run tests

## Manual Setup (Alternative)

If you prefer step-by-step:

### Step 1: Start MongoDB

```powershell
.\scripts\start-mongodb-windows.bat
```

### Step 2: Build the Project

```powershell
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE="$env:VCPKG_ROOT\scripts\buildsystems\vcpkg.cmake" -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j
```

### Step 3: Run Tests

```powershell
cd build
ctest -C Release --output-on-failure
cd ..
```

## Running the SIEM

### Terminal 1: Start the SIEM Server

```powershell
.\build\Release\siemd.exe --config .\config\app.yaml
```

You should see:
```json
{"msg":"siem_ready","rest_port":8080,"ws_port":8081}
```

### Terminal 2: Seed Demo Data

Open a **new PowerShell window**:

```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\seed_demo_data.exe
```

This creates sample incidents that you'll see live in the dashboard!

### Open the Dashboard

```powershell
start ui\static\index.html
```

**You should see incidents streaming in real-time!** 🎉

## Quick Test

Test the REST API:

```powershell
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"ok","service":"cognitive-siem","timestamp":1699392001}
```

## Troubleshooting

### "vcpkg: command not found" or "VCPKG_ROOT not set"

```powershell
# Check if set
$env:VCPKG_ROOT

# If empty, set it
[Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")

# Close and reopen PowerShell
```

### "Docker is not running"

1. Open Docker Desktop from Start menu
2. Wait for whale icon in system tray
3. Try again

### "MongoDB connection failed"

```powershell
# Check if MongoDB is running
docker ps

# If not, start it
docker start siem-mongodb

# Initialize replica set
docker exec siem-mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### Build errors

```powershell
# Clean and rebuild
Remove-Item -Recurse -Force build
.\setup.ps1
```

## What You'll See

1. **MongoDB**: Running in Docker on port 27017
2. **SIEM Server**: Console showing JSON logs
3. **Dashboard**: Web page with live incident updates
4. **Demo Data**: SSH brute force, auth failures, anomalous traffic

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [SETUP_WINDOWS.md](SETUP_WINDOWS.md) for detailed Windows guide
- Explore the code in `src/`
- Try sending your own events via REST API

## Quick Commands Reference

```powershell
# View MongoDB data
docker exec siem-mongodb mongosh cog_siem --eval "db.incidents.find().pretty()"

# View logs
Get-Content logs\siem.log -Wait

# Stop MongoDB
docker stop siem-mongodb

# Start MongoDB
docker start siem-mongodb

# Clean build
Remove-Item -Recurse -Force build

# Rebuild
.\setup.ps1
```

---

**Need help?** See [SETUP_WINDOWS.md](SETUP_WINDOWS.md) for detailed troubleshooting.

