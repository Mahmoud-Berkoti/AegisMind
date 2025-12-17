# ✅ Complete Setup Checklist

## Before You Start

Make sure you have:
- [ ] Windows 10/11
- [ ] Visual Studio 2022 (with "Desktop development with C++")
- [ ] Git installed
- [ ] PowerShell (comes with Windows)

---

## 🔧 One-Time Prerequisites

### Step 1: Install vcpkg (~5 minutes)

```powershell
# Run as Administrator
cd C:\
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
.\bootstrap-vcpkg.bat
[Environment]::SetEnvironmentVariable("VCPKG_ROOT", "C:\vcpkg", "User")
```

✅ **Test**: Close PowerShell, open new one, run `echo $env:VCPKG_ROOT` (should show `C:\vcpkg`)

### Step 2: Install/Start Docker Desktop (~5 minutes)

- Download from https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- Wait for whale icon in system tray

✅ **Test**: Run `docker ps` (should show running containers or empty list)

---

## 🚀 Build & Run (One Command!)

```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\setup.ps1
```

This script will:
1. ✅ Check prerequisites
2. ✅ Start MongoDB (port 27017)
3. ✅ Configure CMake
4. ✅ Download dependencies (vcpkg)
5. ✅ Build the project (~10-15 min first time)
6. ✅ Run tests

**Expected output:**
```
========================================
  Setup Complete!
========================================
```

---

## 🎮 Running the SIEM

### Terminal 1: Start SIEM Server

```powershell
.\build\Release\siemd.exe --config .\config\app.yaml
```

**Wait for:** `{"msg":"siem_ready","rest_port":8080,"ws_port":8081}`

### Terminal 2: Seed Demo Data

```powershell
.\build\Release\seed_demo_data.exe
```

**You'll see:** Creating incidents (SSH brute force, auth failures, etc.)

### Open Dashboard

```powershell
start ui\static\index.html
```

**You should see:** Live incidents updating in real-time! 🎉

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│  Prerequisites (One-Time)                               │
├─────────────────────────────────────────────────────────┤
│  1. Install vcpkg                                       │
│  2. Start Docker Desktop                                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Run setup.ps1 (Automated)                              │
├─────────────────────────────────────────────────────────┤
│  • Starts MongoDB with replica set                      │
│  • Downloads dependencies (mongocxx, boost, etc.)       │
│  • Compiles C++20 code                                  │
│  • Runs tests                                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Terminal 1: Start SIEM                                 │
│  .\build\Release\siemd.exe --config .\config\app.yaml   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Terminal 2: Seed Data                                  │
│  .\build\Release\seed_demo_data.exe                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Open Dashboard                                         │
│  start ui\static\index.html                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                   🎉 Success!
           See live incidents streaming
```

---

## 🎯 What Success Looks Like

### 1. MongoDB Running
```powershell
PS> docker ps
CONTAINER ID   IMAGE     PORTS                      NAMES
abc123def456   mongo:7   0.0.0.0:27017->27017/tcp   siem-mongodb
```

### 2. SIEM Running
```json
{"msg":"siem_ready","rest_port":8080,"ws_port":8081}
{"msg":"change_stream_connected"}
```

### 3. API Working
```powershell
PS> curl http://localhost:8080/health
{"status":"ok","service":"cognitive-siem","timestamp":1699392001}
```

### 4. Dashboard Live
![Dashboard shows]:
- Connected status (green dot)
- Incidents appearing in table
- Stats updating (Total: 3, Open: 2, Critical: 1)
- New incidents highlighted

---

## ⚡ Quick Commands

| Action | Command |
|--------|---------|
| Build everything | `.\setup.ps1` |
| Start SIEM | `.\build\Release\siemd.exe --config .\config\app.yaml` |
| Seed data | `.\build\Release\seed_demo_data.exe` |
| Open dashboard | `start ui\static\index.html` |
| Check MongoDB | `docker ps` |
| View logs | `Get-Content logs\siem.log -Wait` |
| Test API | `curl http://localhost:8080/health` |
| Stop MongoDB | `docker stop siem-mongodb` |
| Start MongoDB | `docker start siem-mongodb` |
| Clean build | `Remove-Item -Recurse -Force build` |

---

## 🔍 Troubleshooting Checklist

### Build fails?
- [ ] Is VCPKG_ROOT set? `echo $env:VCPKG_ROOT`
- [ ] Is Visual Studio 2022 installed?
- [ ] Close and reopen PowerShell

### MongoDB fails?
- [ ] Is Docker Desktop running? `docker ps`
- [ ] Is port 27017 free? `netstat -an | Select-String 27017`
- [ ] Try: `docker start siem-mongodb`

### SIEM won't start?
- [ ] Is MongoDB running? `docker ps`
- [ ] Are ports 8080/8081 free?
- [ ] Check logs: `Get-Content logs\siem.log`

### Dashboard not updating?
- [ ] Is SIEM running?
- [ ] Did you seed data?
- [ ] Check browser console (F12)
- [ ] Is WebSocket connected? (green dot)

---

## 📁 File Structure Quick Reference

```
AegisMind/
├── setup.ps1                    ← Run this to build everything
├── START_HERE.md               ← You are here
├── README.md                   ← Full documentation
├── SETUP_WINDOWS.md            ← Detailed Windows guide
│
├── build/Release/
│   ├── siemd.exe               ← Main SIEM binary
│   └── seed_demo_data.exe      ← Demo data generator
│
├── config/app.yaml             ← Configuration
├── ui/static/index.html        ← Dashboard (open in browser)
└── logs/siem.log               ← Runtime logs
```

---

## 🎓 Learning Path

Once it's running:

1. **Explore the Dashboard**: Watch incidents update in real-time
2. **Try the API**: Use curl to query incidents
3. **Read the Code**: Start with `src/main.cpp`
4. **Send Events**: Use the POST /ingest endpoint
5. **Monitor MongoDB**: `docker exec siem-mongodb mongosh cog_siem`

---

## 📚 Documentation

- **START_HERE.md** (this file) - Quick start
- **SETUP_WINDOWS.md** - Detailed Windows setup
- **README.md** - Complete documentation
- **QUICKSTART.md** - Cross-platform quick start
- **PROJECT_SUMMARY.md** - Architecture overview
- **CONTRIBUTING.md** - Development guide

---

## 🆘 Need Help?

1. Check [SETUP_WINDOWS.md](SETUP_WINDOWS.md) for troubleshooting
2. Verify prerequisites are installed
3. Try clean rebuild: `Remove-Item -Recurse -Force build; .\setup.ps1`
4. Check Docker Desktop is running

---

## ✨ You're Ready!

Everything is set up and ready to go. Just follow the checklist above and you'll have a live SIEM with real-time incident streaming in minutes!

**Happy hunting!** 🔍🛡️

