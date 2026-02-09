# ✅ GET /events Endpoint Added!

I've added the `GET /events` endpoint to your C++ backend. Now you need to rebuild and restart.

## 🔧 What Was Added

### Backend Changes:

**1. New Method in `src/storage/mongo.hpp`:**
```cpp
std::vector<Event> query_recent_events(int limit = 100);
```

**2. Implementation in `src/storage/mongo.cpp`:**
- Queries events from MongoDB
- Sorts by timestamp (most recent first)
- Returns up to `limit` events

**3. New REST Endpoint in `src/api/rest_server.cpp`:**
- `GET /events` - Returns recent security events
- `GET /events?limit=50` - Limit number of results
- Response format:
```json
{
  "events": [...],
  "total": 50
}
```

### UI Changes:

**Updated `ui/src/store/state.ts`:**
- Now fetches both incidents AND events
- Event Stream panel will show real data
- Gracefully falls back if endpoint not available

## 🚀 How to Rebuild & Test

### Step 1: Rebuild C++ Backend

**Option A: Using Developer Command Prompt**
```powershell
# Open "Developer Command Prompt for VS 2019"
cd C:\Users\mberk\Desktop\AegisMind\build
msbuild siemd.vcxproj /p:Configuration=Release /m
```

**Option B: Using Visual Studio**
1. Open `C:\Users\mberk\Desktop\AegisMind\build\CognitiveSIEM.sln`
2. Right-click `siemd` project → Build
3. Wait for compilation to complete

**Option C: Rebuild All (if above don't work)**
```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\rebuild.ps1
```

### Step 2: Stop Old Backend

```powershell
# Stop any running siemd processes
Get-Process siemd -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 3: Start New Backend

```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\siemd.exe
```

You should see:
```
[info] REST server starting on port 8080
[info] GET /events endpoint available
```

### Step 4: Seed Some Events

In another terminal:
```powershell
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\seed_demo_data.exe
```

This will create incidents and events in MongoDB.

### Step 5: Test the Endpoint

```powershell
# Test with PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/events?limit=10" | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

You should see:
```json
{
  "events": [
    {
      "ts": 1699564800,
      "source": "fw",
      "host": "srv-web-01",
      "trace_id": "trace_123",
      "fingerprint": "fp_abc",
      "features": {...}
    },
    ...
  ],
  "total": 10
}
```

### Step 6: Switch UI to Live Mode

```powershell
cd ui
echo "VITE_MOCK=false" | Out-File -FilePath .env -Encoding utf8 -NoNewline

# Restart dev server (Ctrl+C then)
npm run dev:full
```

### Step 7: See Live Events!

1. Open http://localhost:3000
2. Click the **Controls** button (gear icon)
3. Check that **Backend** status shows "running"
4. Check that **Current Mode** shows "Live Backend"
5. Look at the **Event Stream** panel (right side)

You should now see real events streaming in!

## 🎯 What You'll See

### Event Stream Panel:
```
┌─ Event Stream ────────────────┐
│                                │
│ fw                     2m ago  │
│ srv-web-01                     │
│ fp_abc123...                   │
│ → Incident inc_001...          │
│                                │
│ ids                    3m ago  │
│ srv-db-02                      │
│ fp_def456...                   │
│                                │
└────────────────────────────────┘
```

Each event shows:
- **Source**: fw, ids, app, endpoint, auth
- **Host**: Which server/device
- **Fingerprint**: Unique event ID
- **Incident Link**: If correlated to an incident
- **Timestamp**: How long ago

## 🐛 Troubleshooting

### "Failed to compile"
- Make sure you're in the build directory
- Try rebuilding the entire solution

### "Backend not responding"
- Check if siemd.exe is running: `Get-Process siemd`
- Check logs: `Get-Content logs\siem.log -Tail 20`
- Make sure MongoDB is running: `docker ps | findstr mongo`

### "Event Stream still shows placeholder"
- Make sure UI is in Live mode (VITE_MOCK=false)
- Refresh browser hard: Ctrl+Shift+R
- Check browser console for errors (F12)

### "No events showing"
- Run seed_demo_data.exe to generate events
- Or POST events to /ingest endpoint
- Events need to exist in MongoDB first

## 📊 Event Sources

Your SIEM processes events from:
- **fw** - Firewall logs
- **ids** - Intrusion Detection System
- **app** - Application logs
- **endpoint** - Endpoint security agents
- **auth** - Authentication systems

Each event gets:
1. Normalized (standardized format)
2. Fingerprinted (unique ID)
3. Feature-extracted (key attributes)
4. Clustered (grouped with similar events)
5. Correlated (linked to incidents)

All of this happens in your C++ backend!

## ✅ Success Checklist

- [ ] Backend rebuilt successfully
- [ ] Backend running (port 8080)
- [ ] MongoDB running
- [ ] Demo data seeded
- [ ] UI in Live mode
- [ ] Event Stream showing real events
- [ ] Events updating in real-time

---

**Once rebuilt, your SIEM will have a fully functional Event Stream!** 🎉

