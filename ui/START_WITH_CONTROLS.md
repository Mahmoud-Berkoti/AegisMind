# 🚀 Start Dashboard with Docker Controls

The dashboard now has a **System Controls** panel that lets you start/stop MongoDB directly from the UI!

## ✅ Quick Start

```powershell
cd ui

# Install new dependencies
npm install

# Start dashboard with management server
npm run dev:full
```

This will start:
- 🌐 **Dashboard**: http://localhost:3000
- 🔧 **Management API**: http://localhost:3001 (for Docker controls)

## 🎮 Using the Controls

1. **Open** http://localhost:3000
2. **Click the ⚙️ Controls button** (top right)
3. **Use the Docker buttons**:
   - ▶️ **Start** - Start MongoDB container
   - ⏹️ **Stop** - Stop MongoDB container  
   - 🔄 **Restart** - Restart MongoDB container

## 📊 What You'll See

**System Controls Panel:**
- ✅ **Status indicators** for C++ Backend and Mock Mode
- 🐳 **Docker control buttons** (Start/Stop/Restart)
- 📋 **Quick action buttons** that copy commands to clipboard
- 🔄 **Auto-refresh** status every 5 seconds

## 🛠️ Features

### Status Monitoring
- **C++ Backend**: Shows if your SIEM is running
- **Mock Mode**: Shows if using mock data or real backend

### Docker Controls
- Click **Start/Stop/Restart** to control MongoDB
- Commands execute instantly
- Status updates automatically

### Quick Actions
- **Check Status**: Copies `docker ps`
- **View Logs**: Copies `docker logs siem-mongodb --tail 50`
- **Open MongoDB**: Opens MongoDB in browser

### Mode Information
- Shows current mode (Mock vs Live)
- Instructions to switch between modes

## 🐛 Troubleshooting

### "Command copied to clipboard"
If Docker control doesn't work directly, the command is copied to your clipboard. Just paste it in PowerShell and run it manually.

### Management API not running
Make sure you started with `npm run dev:full` instead of just `npm run dev`

### Docker not responding
Make sure Docker Desktop is running on your machine.

## 🎯 Full Workflow

```powershell
# 1. Start dashboard with controls
cd ui
npm run dev:full

# 2. Open http://localhost:3000

# 3. Click ⚙️ Controls button

# 4. Click ▶️ Start MongoDB

# 5. Click Paused → Live (top right)

# 6. Watch incidents stream in real-time!
```

## 💡 Tips

- **Auto-refresh**: Status updates every 5 seconds
- **Copy to clipboard**: Quick action buttons copy commands
- **Keyboard shortcuts**: Commands are pre-formatted for PowerShell
- **Visual feedback**: Green = running, Red = stopped

---

Enjoy your enhanced SIEM dashboard with integrated Docker controls! 🎉

