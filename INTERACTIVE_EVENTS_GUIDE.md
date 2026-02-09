# 🎯 Interactive Event Stream - Feature Guide

## ✅ What's New

Every event in the **Event Stream** panel is now clickable! When you click on an event, a detailed modal pops up showing complete logs and technical details.

## 🖱️ How to Use

### 1. Find an Event

Look at the **Event Stream** panel on the right side of your dashboard:

```
┌─ Event Stream ────────────────┐
│                                │
│ fw                     2m ago  │ ← Click any event
│ srv-web-01                     │
│ fp_abc123...                   │
│ → Incident inc_001...          │
│                                │
│ ids                    3m ago  │ ← Or this one
│ srv-db-02                      │
│                                │
└────────────────────────────────┘
```

### 2. Click to View Details

- **Hover** over any event to see it highlighted
- **Click** anywhere on the event card
- A "View details" hint appears on hover

### 3. Explore the Modal

The Event Details modal shows:

#### 📊 Overview Grid
- **Timestamp**: Exact date/time (both Unix & human-readable)
- **Source**: Event origin (fw, ids, app, endpoint, auth)
- **Host**: Which server/device generated it
- **Fingerprint**: Unique event identifier

#### 🔗 Correlation Info
- **Incident ID**: If correlated to an incident (highlighted in green)
- **Cluster ID**: If grouped with similar events (highlighted in blue)

#### 🔍 Extracted Features
Raw JSON showing all features extracted from the event:
```json
{
  "proto": "tcp",
  "src_ip": "10.0.1.45",
  "dst_ip": "192.168.1.100",
  "dport": 443,
  "bytes": 1024,
  "action": "deny"
}
```

#### 📝 Raw Event Data
Complete event payload in JSON format:
- All fields visible
- Copy-friendly formatting
- Properly indented

#### 🛠️ Technical Details
- **Processing Status**: Normalized → Clustered → Correlated
- **Feature Count**: How many attributes were extracted
- **Source Type**: Full name (e.g., "Firewall", "IDS/IPS")

### 4. Close the Modal

Three ways to close:
1. Click the **X** button (top right)
2. Click the **Close** button (bottom right)
3. Click outside the modal (dark background)

## 🎨 Visual Indicators

### Hover Effects
When you hover over an event:
- Background changes to highlight
- Host name turns cyan
- "View details" hint appears with eye icon

### Event Card States
```
Normal:    Gray background, white text
Hover:     Darker gray, cyan accent
Selected:  Modal opens
```

### Modal Color Coding
- **Incident Correlation**: Green badge (accentC)
- **Cluster ID**: Blue badge (accentB)
- **Source/Fingerprint**: Cyan (accentB/accentC)
- **Features/Raw Data**: Dark code blocks with syntax

## 📱 Keyboard & Accessibility

- **Tab**: Navigate through events (coming soon)
- **Enter**: Open selected event (coming soon)
- **Escape**: Close modal
- **Screen Readers**: All elements properly labeled

## 🔧 What You Can Do With This

### 1. Debug Events
Click an event to see exactly what data was captured:
```
Event shows: "fw - srv-web-01"
Modal reveals: 
  - Exact timestamp
  - Full fingerprint
  - All network details (IPs, ports, bytes)
  - Whether it triggered an incident
```

### 2. Trace Incidents
See which incident an event belongs to:
```
Event card: → Incident inc_001...
Modal: Full incident ID + link (coming soon)
```

### 3. Analyze Clusters
Check if events are being grouped correctly:
```
Event 1: cluster_id = clus_abc123
Event 2: cluster_id = clus_abc123
Modal: Both show same cluster ID → correctly grouped!
```

### 4. Verify Normalization
Confirm your events are being processed:
```
Processing Status: 
  ✓ Normalized   (all events)
  ✓ Clustered    (if cluster_id present)
  ✓ Correlated   (if incident_id present)
```

### 5. Copy Raw Data
Click an event, scroll to "Raw Event Data", copy the JSON:
```json
{
  "trace_id": "trc_1699564800_abc123",
  "timestamp": 1699564800,
  "source": "fw",
  "host": "srv-web-01",
  "fingerprint": "fp_sha256_abc123...",
  "features": {
    "src_ip": "10.0.1.45",
    "dst_ip": "192.168.1.100"
  }
}
```
Then paste into your own tools for analysis!

## 🎯 Real-World Use Cases

### Security Analyst
```
1. Notice spike in firewall blocks
2. Click first event in Event Stream
3. See source IP, destination, port
4. Check if correlated to incident
5. Click next event to compare
6. Identify attack pattern
```

### DevOps Engineer
```
1. Application alert fires
2. Click event to see exact error
3. Check extracted features for stack trace
4. See which host is affected
5. Copy raw JSON for ticket
6. Correlate with other events
```

### SOC Operator
```
1. Multiple IDS alerts
2. Click each event
3. Check if same cluster_id
4. Verify all linked to same incident
5. Confirm proper correlation
6. Escalate incident if needed
```

## 📊 What Each Source Type Shows

### Firewall (fw)
```
Features might include:
- src_ip, dst_ip
- dport (destination port)
- proto (tcp/udp)
- action (allow/deny)
- bytes transferred
```

### IDS/IPS (ids)
```
Features might include:
- signature_id
- severity
- attack_type
- payload_sample
- blocked (yes/no)
```

### Application (app)
```
Features might include:
- error_code
- stack_trace
- user_id
- session_id
- endpoint
```

### Endpoint (endpoint)
```
Features might include:
- process_name
- file_path
- user
- command_line
- parent_process
```

### Authentication (auth)
```
Features might include:
- username
- result (success/fail)
- src_ip
- method (password/2fa)
- attempts
```

## 🐛 Troubleshooting

### "No events in Event Stream"
- Make sure backend is running (`.\build\Release\siemd.exe`)
- Seed demo data (`.\build\Release\seed_demo_data.exe`)
- Check UI is in Live mode (not mock mode)
- Verify `/events` endpoint working: `curl http://localhost:8080/events`

### "Modal doesn't open when I click"
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors (F12)
- Make sure JavaScript is enabled
- Try different event

### "Features show empty {}"
- Some events may have no extracted features
- This is normal for minimal test events
- Real production events will have many features

### "Modal shows wrong data"
- This shouldn't happen
- If it does, refresh the page
- Check browser console for errors

## 🚀 Coming Soon

Future enhancements for interactive events:

- [ ] **Keyboard Navigation**: Tab through events, Enter to open
- [ ] **Event Search**: Filter/search within event stream
- [ ] **Export Event**: Download event as JSON file
- [ ] **Link to Incident**: Click incident ID to jump to incident details
- [ ] **Compare Events**: Select multiple events and compare side-by-side
- [ ] **Event Timeline**: Visual timeline showing event relationships
- [ ] **Copy Fingerprint**: One-click copy buttons
- [ ] **Related Events**: Show other events with same cluster_id

## ✅ Quick Test

**To verify it's working:**

1. Open dashboard: `http://localhost:3000`
2. Make sure Event Stream shows events (not placeholder)
3. Hover over any event → should see highlight + "View details"
4. Click event → modal should pop up
5. See all event details displayed
6. Click Close or outside modal → modal closes
7. Click different event → new details shown

**Success!** You now have fully interactive events! 🎉

---

**Files Modified:**
- `ui/src/components/EventDetailsModal.tsx` (new)
- `ui/src/pages/IncidentDashboard.tsx` (updated)

**No backend changes needed** - this is pure UI enhancement!

