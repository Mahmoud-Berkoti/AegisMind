# Deployment Guide for AegisMind SIEM

This guide walks you through deploying AegisMind SIEM from GitHub to your own environment.

## Prerequisites

Before you begin, ensure you have:

- [ ] Git installed
- [ ] Docker Desktop (for MongoDB)
- [ ] C++20 compatible compiler (MSVC 2019+ on Windows, GCC 11+ on Linux, Clang 13+ on macOS)
- [ ] CMake 3.20+
- [ ] vcpkg for dependency management
- [ ] Node.js 16+ (for UI)

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/AegisMind.git
cd AegisMind
```

## Step 2: Configure Security (CRITICAL!)

### Create Configuration File

```bash
# Copy the example configuration
cp config/app.yaml.example config/app.yaml
```

### Generate HMAC Secret

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Linux/macOS:**
```bash
openssl rand -base64 32
```

### Update config/app.yaml

Edit `config/app.yaml` and replace the HMAC secret:

```yaml
security:
  hmac_secret: "YOUR_GENERATED_SECRET_HERE"  # Paste your generated secret
  max_body_size: 1048576
```

**IMPORTANT:** Never commit `config/app.yaml` to version control! It's already in `.gitignore`.

## Step 3: Set Up MongoDB

### Option A: Docker (Recommended for Local Development)

```bash
# Start MongoDB with replica set
docker-compose up -d mongodb

# Wait 10 seconds for initialization
```

Verify MongoDB is running:
```bash
docker exec siem-mongodb mongosh --eval "rs.status()" --quiet
```

You should see `"stateStr": "PRIMARY"` in the output.

### Option B: MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Configure network access (add your IP)
4. Create a database user
5. Get your connection string

Update `config/app.yaml`:
```yaml
   mongo:
     uri: "mongodb+srv://<your_username>:<your_password>@<your_cluster_address>/?retryWrites=true&w=majority"
     db: "cog_siem"
```

## Step 4: Build the Backend

### Install vcpkg (if not already installed)

**Windows:**
```powershell
git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
cd C:\vcpkg
.\bootstrap-vcpkg.bat
$env:VCPKG_ROOT = "C:\vcpkg"
```

**Linux/macOS:**
```bash
git clone https://github.com/Microsoft/vcpkg.git ~/vcpkg
cd ~/vcpkg
./bootstrap-vcpkg.sh
export VCPKG_ROOT=~/vcpkg
```

### Build the Project

**Windows:**
```powershell
cd AegisMind
.\configure-and-build.bat
```

**Linux/macOS:**
```bash
cd AegisMind
./scripts/build.sh
```

This will:
- Install all dependencies via vcpkg (~10-15 minutes first time)
- Compile the SIEM backend
- Run unit tests

## Step 5: Set Up the UI

```bash
cd ui
npm install
```

## Step 6: Start the System

### Start Backend

**Windows:**
```powershell
.\build\Release\siemd.exe config\app.yaml
```

**Linux/macOS:**
```bash
./build/siemd config/app.yaml
```

You should see:
```json
{"msg":"siem_ready","rest_port":8080,"ws_port":8081}
```

### Verify Backend Health

In a new terminal:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"service":"cognitive-siem","status":"ok","timestamp":1699392001}
```

### Seed Demo Data (Optional)

```bash
# Windows
.\build\Release\seed_demo_data.exe

# Linux/macOS
./build/seed_demo_data
```

### Start UI

```bash
cd ui
npm run dev
```

The UI will start at `http://localhost:5173` (or `http://localhost:3001` if 5173 is busy).

## Step 7: Verify Everything Works

1. **Open the UI**: Navigate to `http://localhost:5173` (or the port shown)
2. **Check Dashboard**: You should see the AegisMind home page
3. **View Incidents**: Click "Enter Security Operations Center"
4. **WebSocket Connection**: Check the footer - should show "WebSocket: Connected"
5. **Live Updates**: If you seeded demo data, incidents should appear

## Production Deployment

### Additional Steps for Production

1. **Use a Reverse Proxy (nginx/Apache)**
   ```nginx
   # nginx example
   server {
       listen 443 ssl;
       server_name siem.yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /stream {
           proxy_pass http://localhost:8081;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

2. **Set Up as a Service**

   **Windows (NSSM):**
   ```powershell
   nssm install AegisMind "C:\path\to\siemd.exe" "C:\path\to\config\app.yaml"
   nssm start AegisMind
   ```

   **Linux (systemd):**
   ```bash
   sudo tee /etc/systemd/system/aegismind.service > /dev/null <<EOF
   [Unit]
   Description=AegisMind SIEM
   After=network.target mongodb.service
   
   [Service]
   Type=simple
   User=siem
   WorkingDirectory=/opt/aegismind
   ExecStart=/opt/aegismind/siemd /opt/aegismind/config/app.yaml
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   sudo systemctl enable aegismind
   sudo systemctl start aegismind
   ```

3. **Build UI for Production**
   ```bash
   cd ui
   npm run build
   
   # Serve with nginx or Apache
   # Files will be in ui/dist/
   ```

4. **Configure Firewall**
   ```bash
   # Linux (ufw)
   sudo ufw allow 8080/tcp
   sudo ufw allow 8081/tcp
   
   # Or restrict to specific IPs
   sudo ufw allow from 192.168.1.0/24 to any port 8080
   ```

## Troubleshooting

### Backend Won't Start

**Check Configuration:**
```bash
# Verify config file exists
ls -la config/app.yaml

# Check MongoDB connection
docker ps | grep mongo
```

**Common Issues:**
- MongoDB not running → Start with `docker-compose up -d mongodb`
- Wrong config path → Use full path to `app.yaml`
- Port already in use → Change ports in `config/app.yaml`

### UI Won't Connect

**Check Backend:**
```bash
curl http://localhost:8080/health
```

**Check WebSocket:**
```bash
curl http://localhost:8081/stream
```

**Common Issues:**
- Backend not running → Start backend first
- Wrong ports in UI → Check `ui/src/` for hardcoded ports
- CORS issues → Backend allows all origins by default

### MongoDB Connection Failed

**Verify Replica Set:**
```bash
docker exec siem-mongodb mongosh --eval "rs.status()"
```

**Reinitialize if needed:**
```bash
docker exec siem-mongodb mongosh --eval "rs.initiate()"
```

### No Incidents Showing

1. Seed demo data: `./build/Release/seed_demo_data.exe`
2. Check MongoDB: `docker exec siem-mongodb mongosh cog_siem --eval "db.incidents.count()"`
3. Check WebSocket in browser console (F12)

## Monitoring

### Log Files

```bash
# View logs
tail -f logs/siem.log

# Search for errors
grep -i error logs/siem.log
```

### MongoDB Metrics

```javascript
// Connect to MongoDB
docker exec -it siem-mongodb mongosh cog_siem

// View recent incidents
db.incidents.find().sort({created_at: -1}).limit(10)

// Check metrics
db.metrics_ts.find().sort({ts: -1}).limit(20)

// Audit trail
db.audit_log.find().sort({timestamp: -1}).limit(20)
```

### System Health

```bash
# Backend processes
ps aux | grep siemd

# Resource usage
top -p $(pgrep siemd)

# Network connections
netstat -tlnp | grep -E '8080|8081'
```

## Updating

To update to the latest version:

```bash
# Backup your config
cp config/app.yaml config/app.yaml.backup

# Pull latest changes
git pull origin main

# Rebuild
./scripts/build.sh  # or configure-and-build.bat on Windows

# Update UI
cd ui
npm install
npm run build

# Restart services
```

## Support

- **Documentation**: See [README.md](README.md) and [SECURITY.md](SECURITY.md)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/AegisMind/issues)
- **Security**: See [SECURITY.md](SECURITY.md) for security concerns

## Post-Deployment Checklist

After deployment, verify:

- [ ] Backend health endpoint responds
- [ ] UI loads correctly
- [ ] WebSocket connects successfully
- [ ] Demo data appears in dashboard
- [ ] MongoDB is secure (authentication enabled)
- [ ] HMAC secret is unique and strong
- [ ] Logs are being written
- [ ] Firewall rules are configured
- [ ] HTTPS is enabled (production)
- [ ] Monitoring is set up
- [ ] Backups are configured
- [ ] Documentation is updated with your specifics

## Success!

You now have a fully deployed AegisMind SIEM system! Visit the UI to start monitoring security incidents in real-time.

---

**Next Steps:**
1. Review [SECURITY.md](SECURITY.md) for production hardening
2. Configure your log sources to send events
3. Set up alerting and notifications
4. Customize correlation rules
5. Train your team on the platform
