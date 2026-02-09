# Quick Start Guide

Get Cognitive SIEM running in under 10 minutes!

## Prerequisites Check

- [ ] C++20 compiler (GCC 11+, Clang 13+, or MSVC 2019+)
- [ ] CMake 3.20+
- [ ] vcpkg installed
- [ ] Docker (for MongoDB)
- [ ] Git

## Step-by-Step Setup

### 1. Clone and Setup vcpkg

```bash
# If you don't have vcpkg already
git clone https://github.com/Microsoft/vcpkg.git ~/vcpkg
cd ~/vcpkg
./bootstrap-vcpkg.sh  # or bootstrap-vcpkg.bat on Windows
export VCPKG_ROOT=$(pwd)
```

Add to your `.bashrc` or `.zshrc`:
```bash
export VCPKG_ROOT=/path/to/vcpkg
```

### 2. Start MongoDB

Using Docker Compose (recommended):
```bash
# From project root
./scripts/setup-mongodb.sh
```

Or manually with Docker:
```bash
docker run -d --name siem-mongo \
  -p 27017:27017 \
  mongo:7 --replSet rs0

# Initialize replica set
docker exec -it siem-mongo mongosh --eval "rs.initiate()"
```

Verify MongoDB is running:
```bash
docker ps | grep mongo
```

### 3. Build the Project

**Linux/macOS:**
```bash
./scripts/build.sh
```

**Windows:**
```powershell
.\scripts\build.bat
```

**Manual build:**
```bash
cmake -S . -B build \
  -DCMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake \
  -DCMAKE_BUILD_TYPE=Release

cmake --build build -j
```

This will:
- Install all dependencies via vcpkg (first time takes ~10-15 min)
- Compile the project
- Run tests

### 4. Configure

Edit `config/app.yaml` if needed (defaults should work):
```yaml
mongo:
  uri: "mongodb://localhost:27017/?replicaSet=rs0"
  db: "cog_siem"

server:
  ws_port: 8081
  rest_port: 8080
```

**Important**: Change `security.hmac_secret` in production!

### 5. Start the SIEM

```bash
./build/siemd --config ./config/app.yaml
```

You should see:
```
{"msg":"siem_ready","rest_port":8080,"ws_port":8081}
```

### 6. Seed Demo Data

In another terminal:
```bash
./build/seed_demo_data
```

This creates sample incidents:
- SSH brute force attempts
- Failed authentication events
- Anomalous data exfiltration

### 7. Open the Dashboard

**Option A - Direct file access:**
Open `ui/static/index.html` in your browser

**Option B - Local server (recommended):**
```bash
# Python 3
python3 -m http.server 8000 --directory ui/static

# Or with Node.js
npx serve ui/static -p 8000
```

Then navigate to `http://localhost:8000`

You should see live incidents streaming in real-time!

## Verification

### Check Health
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "cognitive-siem",
  "timestamp": 1699392001
}
```

### Query Incidents
```bash
curl http://localhost:8080/incidents | jq
```

### View MongoDB Data
```bash
docker exec -it siem-mongo mongosh cog_siem --eval "db.incidents.find().pretty()"
```

### Test WebSocket
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8081/stream');
ws.onmessage = (e) => console.log('Incident update:', JSON.parse(e.data));
```

## Testing Ingest

Generate HMAC signature (Python):
```python
import hmac
import hashlib
import base64
import json

secret = "your-secret-key-change-in-production"
body = json.dumps([{
    "ts": "2025-11-08T10:00:00Z",
    "source": "test",
    "host": "test-host",
    "entity": {"ip": "192.168.1.100"},
    "verb": "test",
    "outcome": "success"
}])

signature = base64.b64encode(
    hmac.new(secret.encode(), body.encode(), hashlib.sha256).digest()
).decode()

print(f"Body: {body}")
print(f"Signature: {signature}")
```

Then send request:
```bash
curl -X POST http://localhost:8080/ingest \
  -H "Content-Type: application/json" \
  -H "X-Signature: YOUR_SIGNATURE_HERE" \
  -d '[{"ts":"2025-11-08T10:00:00Z","source":"test","host":"test-host"}]'
```

## Troubleshooting

### Build Issues

**vcpkg not found:**
```bash
export VCPKG_ROOT=/path/to/vcpkg
```

**Missing dependencies:**
```bash
cd $VCPKG_ROOT
./vcpkg install mongo-cxx-driver boost-beast spdlog nlohmann-json cli11 yaml-cpp openssl catch2
```

### MongoDB Issues

**Can't connect:**
- Ensure MongoDB is running: `docker ps`
- Check replica set: `docker exec -it siem-mongo mongosh --eval "rs.status()"`
- Verify port 27017 is open

**Replica set not initialized:**
```bash
docker exec -it siem-mongo mongosh --eval "rs.initiate()"
```

### WebSocket Not Connecting

- MongoDB replica set must be active (change streams require it)
- Check firewall allows port 8081
- Verify SIEM is running: check logs

### No Incidents Showing

1. Run seed script: `./build/seed_demo_data`
2. Check logs: `tail -f logs/siem.log`
3. Query MongoDB: `docker exec -it siem-mongo mongosh cog_siem --eval "db.incidents.count()"`
4. Check WebSocket status in browser console

## Next Steps

- Read the full [README.md](README.md) for architecture details
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Explore the API in the README
- Deploy to production (update secrets, enable TLS)

## Common Commands

```bash
# Start MongoDB
docker-compose up -d mongodb

# Stop MongoDB
docker-compose down

# View SIEM logs
tail -f logs/siem.log

# Run tests
cd build && ctest --output-on-failure

# Clean build
rm -rf build && ./scripts/build.sh

# Stop SIEM
# Press Ctrl+C in terminal running siemd
```

## Production Deployment

Before deploying to production:

1. **Change secrets** in `config/app.yaml`
2. **Enable TLS** for MongoDB and HTTP
3. **Set up monitoring** (metrics collection)
4. **Configure log rotation**
5. **Set resource limits** (CPU, memory)
6. **Enable authentication** on MongoDB
7. **Review security** settings

See README.md Security section for details.

## Success! 🎉

You now have a fully functional real-time SIEM with:
- Live incident streaming via WebSocket
- Event normalization and clustering
- Correlation engine
- REST API for queries
- Audit trail
- Metrics collection

Happy hunting! 🔍

