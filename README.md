# Cognitive SIEM

A production-grade, real-time Security Information and Event Management (SIEM) system built with modern C++20. Features intelligent event clustering, incident correlation, and live WebSocket updates powered by MongoDB change streams.

##  Security Notice

**IMPORTANT:** Before deploying this project:

1. **Copy `config/app.yaml.example` to `config/app.yaml`**
2. **Generate a strong HMAC secret** (see [SECURITY.md](SECURITY.md))
3. **Never commit `config/app.yaml` to version control**
4. **Review the [Security Configuration Guide](SECURITY.md)**
5. **Follow the [Deployment Guide](DEPLOYMENT_GUIDE.md)**

The example configuration files contain placeholder values that **MUST** be changed before deployment.

##  Features

- **Real-time Event Processing**: Ingest, normalize, and process security events in near real-time
- **Intelligent Clustering**: Locality-sensitive hashing with Jaccard/Cosine similarity for event grouping
- **Incident Correlation**: Automatic correlation of events into actionable incidents
- **Live Updates**: WebSocket streaming of incident changes via MongoDB change streams
- **REST API**: Query incidents and ingest events with HMAC authentication
- **Time-Series Storage**: Efficient MongoDB time-series collections with automatic TTL
- **Structured Audit Trail**: Complete audit log of all incident state changes
- **Metrics Collection**: Performance monitoring and operational metrics
- **Minimal & Fast**: Production-ready C++20 codebase optimized for performance

## Prerequisites

- **C++20 compatible compiler** (GCC 11+, Clang 13+, MSVC 2019+)
- **CMake** 3.20+
- **vcpkg** for dependency management
- **MongoDB** 4.4+ with replica set enabled
- **Git**

## Dependencies

All dependencies are managed via vcpkg:

- `mongo-cxx-driver` - MongoDB C++ driver
- `boost-beast` - HTTP/WebSocket server
- `spdlog` - Structured logging
- `nlohmann-json` - JSON parsing
- `cli11` - Command-line interface
- `yaml-cpp` - Configuration parsing
- `openssl` - Cryptography (HMAC)
- `catch2` - Unit testing

##  Quick Start

> **First Time Setup?** Follow the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

### 1. Configure Security (Required!)

```bash
# Copy example configuration
cp config/app.yaml.example config/app.yaml

# Generate a strong HMAC secret
openssl rand -base64 32  # Linux/macOS
# OR on Windows PowerShell:
# [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Edit config/app.yaml and paste your secret into the hmac_secret field
```

See [SECURITY.md](SECURITY.md) for complete security configuration.

### 2. Install vcpkg

```bash
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh  # or bootstrap-vcpkg.bat on Windows
export VCPKG_ROOT=$(pwd)
```

### 3. Start MongoDB Replica Set

```bash
# Start MongoDB with replica set
docker run -d --name mongo-siem \
  -p 27017:27017 \
  mongo:7 --replSet rs0

# Initialize replica set
docker exec -it mongo-siem mongosh --eval "rs.initiate()"
```

### 4. Build the Project

```bash
# Configure
cmake -S . -B build \
  -DCMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake \
  -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build build -j$(nproc)
```

### 5. Run Tests

```bash
cd build
ctest --output-on-failure
```

### 6. Start the SIEM

```bash
./build/siemd --config ./config/app.yaml
```

### 7. Seed Demo Data

In another terminal:

```bash
./build/seed_demo_data
```

### 8. Open the UI

Open `ui/static/index.html` in your browser or serve it:

```bash
python3 -m http.server 8000 --directory ui/static
```

Then navigate to `http://localhost:8000`

##  Project Structure

```
.
├── CMakeLists.txt              # Build configuration
├── vcpkg.json                  # Dependency manifest
├── config/
│   └── app.yaml               # Application configuration
├── src/
│   ├── main.cpp               # Main application
│   ├── core/                  # Core logic
│   │   ├── event_normalizer.{hpp,cpp}
│   │   ├── incident_clusterer.{hpp,cpp}
│   │   ├── correlation.{hpp,cpp}
│   │   └── ids.{hpp,cpp}
│   ├── storage/               # MongoDB integration
│   │   ├── mongo.{hpp,cpp}
│   │   ├── schemas.hpp
│   │   └── change_stream.{hpp,cpp}
│   ├── ingest/                # Event ingestion
│   │   ├── file_ingestor.{hpp,cpp}
│   │   └── http_ingestor.{hpp,cpp}
│   ├── api/                   # HTTP/WebSocket servers
│   │   ├── websocket_server.{hpp,cpp}
│   │   └── rest_server.{hpp,cpp}
│   ├── audit/                 # Audit logging
│   │   └── auditor.{hpp,cpp}
│   └── metrics/               # Metrics collection
│       └── metrics.{hpp,cpp}
├── ui/
│   └── static/
│       └── index.html         # Live incident dashboard
├── tests/
│   ├── test_normalizer.cpp
│   ├── test_clusterer.cpp
│   └── test_ids.cpp
├── scripts/
│   └── seed_demo_data.cpp     # Demo data generator
└── README.md
```

##  Configuration

** IMPORTANT:** Copy `config/app.yaml.example` to `config/app.yaml` and customize it.

```bash
cp config/app.yaml.example config/app.yaml
```

Key configuration sections in `config/app.yaml`:

```yaml
mongo:
  uri: "mongodb://localhost:27017/?replicaSet=rs0"  # Your MongoDB connection
  db: "cog_siem"

server:
  ws_port: 8081
  rest_port: 8080
  bind_address: "0.0.0.0"  # Use 127.0.0.1 for localhost only

clustering:
  window_seconds: 120
  min_events: 5
  similarity_threshold: 0.75

retention:
  events_days: 14  # Adjust based on your storage needs

logging:
  level: "info"
  file: "logs/siem.log"

security:
  hmac_secret: "PLEASE_CHANGE_THIS_SECRET_BEFORE_USE"  # ⚠️ MUST CHANGE!
  max_body_size: 1048576
```

** Security Configuration:**
- Generate a strong HMAC secret (see [SECURITY.md](SECURITY.md))
- Never commit `config/app.yaml` to version control
- Review all settings before production deployment

See the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed configuration instructions.

##  API Reference

### REST Endpoints

#### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "cognitive-siem",
  "timestamp": 1699392001
}
```

#### Ingest Events
```bash
POST /ingest
Headers:
  X-Signature: base64(hmac_sha256(body, secret))
Body: [
  {
    "ts": "2025-11-07T23:00:01Z",
    "source": "fw",
    "host": "edge-01",
    "entity": {"ip": "10.0.0.7"},
    "verb": "deny",
    "object": {"proto": "tcp", "dport": 22},
    "outcome": "block"
  }
]
```

**Response:**
```json
{
  "accepted": 1,
  "rejected": 0
}
```

#### Query Incidents
```bash
GET /incidents?status=open&limit=100
```

#### Get Incident
```bash
GET /incidents/{id}
```

### WebSocket

Connect to `ws://localhost:8081/stream`

**Server Messages:**
```json
{
  "type": "incident.insert",
  "doc": {
    "_id": "inc_lx9k3m2p",
    "status": "open",
    "title": "SSH brute force attempt",
    "severity": "high",
    "entity": {"host": "edge-01", "ip": "10.0.0.7"},
    "scores": {"anomaly": 0.93, "confidence": 0.88}
  },
  "timestamp": 1699392001
}
```

##  Architecture

### Event Flow

```
Raw Events → Normalizer → Clusterer → Correlator → Storage
                                                        ↓
                                              MongoDB (time-series)
                                                        ↓
                                              Change Stream
                                                        ↓
                                              WebSocket Broadcast
                                                        ↓
                                                    UI Updates
```

### Key Components

1. **Event Normalizer**: Standardizes events, computes fingerprints, extracts features
2. **Incident Clusterer**: LSH-based clustering with similarity metrics
3. **Correlation Engine**: Groups events into incidents by entity
4. **Change Stream Watcher**: Monitors MongoDB for real-time updates
5. **WebSocket Server**: Broadcasts incident changes to connected clients
6. **REST Server**: Handles ingestion and queries with HMAC auth

## Testing

Run all tests:
```bash
cd build
ctest --output-on-failure
```

Run specific test:
```bash
./build/siem_tests "[normalizer]"
```

##  Monitoring

Metrics are automatically collected and stored in MongoDB:

- `events_ingested_total` - Total events processed
- `ingest_batch_seconds` - Batch processing time
- `cluster_assign_seconds` - Clustering time
- `ws_clients` - Connected WebSocket clients

Query metrics:
```javascript
db.metrics_ts.find().sort({ts: -1}).limit(100)
```

##  Security

** READ BEFORE DEPLOYING:** [Security Configuration Guide](SECURITY.md)

### Security Features

- **HMAC Signature**: All ingest requests require HMAC-SHA256 signature
- **TLS Support**: Enable TLS in MongoDB connection string
- **Secret Redaction**: Automatic redaction of sensitive fields
- **Audit Trail**: Complete audit log of incident changes
- **Rate Limiting**: Configurable event rate limits
- **Input Validation**: Schema validation and size limits

### Pre-Deployment Security Checklist

- [ ] Generate and set a strong `hmac_secret`
- [ ] Copy `config/app.yaml.example` to `config/app.yaml` with your settings
- [ ] Use secure MongoDB connection (authentication + TLS)
- [ ] Configure firewall rules
- [ ] Set appropriate `bind_address` (not 0.0.0.0 for production)
- [ ] Enable HTTPS for REST API (use reverse proxy)
- [ ] Review and adjust rate limits
- [ ] Set up log rotation
- [ ] Configure automated backups

### Configuration Files

| File | Purpose | Commit to Git? |
|------|---------|---------------|
| `config/app.yaml.example` | Template configuration | ✅ Yes |
| `config/app.yaml` | Your actual configuration | ❌ **NO** |
| `.env.example` | Environment variable template | ✅ Yes |
| `.env` | Your environment variables | ❌ **NO** |

**The actual configuration files are in `.gitignore` to protect your secrets.**

##  Threat Model (STRIDE)

| Threat | Mitigation |
|--------|------------|
| Spoofed ingest | HMAC headers, TLS client certs |
| Tampered incidents | Audit trail, RBAC (future) |
| Replay attacks | Idempotency keys, timestamps |
| DoS | Rate limiting, queue bounds, sampling |
| Info leak | Field allowlist, PII redaction |

##  Performance

- **Throughput**: 10,000+ events/minute
- **Latency**: P99 < 200ms for WebSocket broadcast
- **Resource Usage**: ≤2 CPU cores, ≤2GB RAM
- **Storage**: Time-series with automatic TTL

##  Troubleshooting

### MongoDB Connection Failed
```bash
# Check replica set status
docker exec -it mongo-siem mongosh --eval "rs.status()"

# Reinitialize if needed
docker exec -it mongo-siem mongosh --eval "rs.initiate()"
```

### WebSocket Not Connecting
- Ensure MongoDB replica set is running (change streams require it)
- Check firewall rules for port 8081
- Verify `ws_port` in config matches UI connection

### No Incidents Appearing
- Run seed script: `./build/seed_demo_data`
- Check logs: `tail -f logs/siem.log`
- Verify MongoDB has data: `db.incidents.find()`

##  License

MIT License - see LICENSE file for details

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

##  Further Reading

- [MongoDB Change Streams](https://docs.mongodb.com/manual/changeStreams/)
- [Boost.Beast](https://www.boost.org/doc/libs/release/libs/beast/)
- [C++20 Features](https://en.cppreference.com/w/cpp/20)
- [SIEM Best Practices](https://www.sans.org/reading-room/whitepapers/logging/)

##  Acknowledgments

Built with modern C++20, leveraging industry-standard libraries for production reliability.

---

**Author**: Mahmoud Berkoti
**Version**: 1.0.0  (more to come)
**Status**: YC save me

