# ✅ Updated UI to Match Your C++ SIEM Backend

The dashboard has been completely redesigned to work with your **Cognitive SIEM** backend!

## What Changed

### Before (Generic Employee Device Dashboard)
- ❌ Employee/Contingent devices
- ❌ Compliance charts
- ❌ Training progress
- ❌ No relation to backend

### After (Incident Management Dashboard) ✅
- ✅ **Real incident tracking** from your SIEM
- ✅ **Event stream** showing normalized security events
- ✅ **Severity levels**: low, medium, high, critical
- ✅ **Status tracking**: open, ack, closed
- ✅ **Live updates** via WebSocket
- ✅ **Matches your C++ schemas exactly**

## Current Dashboard Features

### Stats Row (Top)
- **Total Incidents**: Count of all incidents
- **Open Incidents**: Currently active
- **Critical**: High-priority incidents
- **Events/Hour**: Ingestion rate

### Incident List (Main Panel)
- Shows all incidents with:
  - Severity badge (color-coded)
  - Status badge (open/ack/closed)
  - Incident ID
  - Title (e.g., "Multiple failed SSH login attempts from 192.168.1.100")
  - Host information
  - Event count
  - Confidence score
  - Timestamp

### Event Stream (Right Panel)
- Real-time events being ingested
- Shows:
  - Source (fw, ids, app, endpoint, auth)
  - Host
  - Fingerprint
  - Link to incident (if correlated)

## Backend Integration

### Mock Mode (Current)
```bash
# Running with VITE_MOCK=true (default)
npm run dev
```
- Uses realistic mock data
- Shows 25+ sample incidents
- Simulates real-time updates every 5 seconds

### Real Backend Mode
```bash
# Make sure your C++ SIEM is running:
# Terminal 1:
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\siemd.exe

# Terminal 2:
cd ui
echo "VITE_MOCK=false" > .env
npm run dev
```

The UI will automatically connect to:
- **REST API**: `http://localhost:8080`
- **WebSocket**: `ws://localhost:8081`

### API Endpoints Used

```
GET  /health           - Health check
GET  /incidents        - List incidents (with filters)
GET  /incidents/:id    - Get single incident
GET  /events          - Get recent events
GET  /stats           - Dashboard statistics
POST /ingest          - Ingest new events
PUT  /incidents/:id/status - Update status
```

### WebSocket Messages

```typescript
{
  type: 'incident.created',
  incident: { ... }
}

{
  type: 'incident.updated',
  incident: { ... }
}

{
  type: 'event.ingested',
  event: { ... }
}
```

## Visual Design

### Color Scheme
- **Background**: `#0E1014` (dark)
- **Panels**: `#151922`
- **Text**: `#E9ECF1`

### Severity Colors
- **Low**: Blue
- **Medium**: Yellow
- **High**: Orange
- **Critical**: Red

### Status Colors
- **Open**: Red (needs attention)
- **Ack**: Yellow (acknowledged)
- **Closed**: Green (resolved)

## Key Files Changed

```
ui/src/
├── types.ts              ✅ Matches C++ schemas
├── lib/
│   ├── api.ts            ✅ Calls your REST endpoints
│   └── ws.ts             ✅ Connects to your WebSocket
├── store/
│   └── state.ts          ✅ Manages incidents/events
├── mocks/
│   ├── data.ts           ✅ Realistic security incidents
│   └── server.ts         ✅ Mock SIEM responses
├── pages/
│   └── IncidentDashboard.tsx  ✅ New main dashboard
└── main.tsx              ✅ Updated entry point
```

## Testing with Real Backend

### Step 1: Start C++ SIEM
```powershell
cd C:\Users\mberk\Desktop\AegisMind

# Make sure MongoDB is running
docker ps | findstr mongo

# Start SIEM
.\build\Release\siemd.exe
```

You should see:
```
[2024-...] [info] Starting SIEM...
[2024-...] [info] REST server listening on 0.0.0.0:8080
[2024-...] [info] WebSocket server listening on 0.0.0.0:8081
```

### Step 2: Disable Mock Mode
```powershell
cd ui
echo "VITE_MOCK=false" > .env
```

### Step 3: Restart UI
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Seed Demo Data
```powershell
# In another terminal
cd C:\Users\mberk\Desktop\AegisMind
.\build\Release\seed_demo_data.exe
```

### Step 5: Watch Live Updates
- Open dashboard at `http://localhost:3000`
- Click the **Live** button (top right)
- New incidents will appear in real-time!

## Data Flow

```
1. Events ingested → POST /ingest
2. C++ backend processes:
   - Normalizes events
   - Extracts features
   - Clusters similar events
   - Correlates into incidents
3. Incidents stored in MongoDB
4. Change stream triggers WebSocket update
5. UI receives update and displays
```

## Next Steps

1. **Test with mock data** (current state) ✅
2. **Start your C++ backend**
3. **Disable mock mode** (`VITE_MOCK=false`)
4. **Seed real incidents** with `seed_demo_data.exe`
5. **Watch live updates** in the dashboard

## Sample Incident Types

The mock data includes realistic incidents:
- Multiple failed SSH login attempts
- Suspicious outbound traffic
- Malware signatures detected
- Port scan activity
- SQL injection attempts
- Privilege escalation
- DDoS attacks
- Brute force attacks
- Data exfiltration attempts
- Ransomware behavior
- C2 communication attempts

All matching real security scenarios your SIEM would detect!

## Troubleshooting

### Dashboard shows "Failed to load data"
- ✅ Check C++ backend is running
- ✅ Check MongoDB is running
- ✅ Check `VITE_MOCK=false` in `.env`
- ✅ Check ports 8080 and 8081 are not blocked

### No live updates
- ✅ Click "Live" button in dashboard
- ✅ Check WebSocket connection in browser console
- ✅ Check backend is streaming changes

### "No incidents found"
- ✅ Run `seed_demo_data.exe` to create test incidents
- ✅ Or POST events to `/ingest` endpoint

---

**Your dashboard now perfectly matches your C++ SIEM backend!**

Open http://localhost:3000 to see it in action!
