# Security Configuration Guide

This document explains how to securely configure AegisMind SIEM for deployment.

## Important: Before You Deploy

**NEVER commit sensitive credentials to version control!**

The repository includes example configuration files. You must create your own configuration with secure credentials.

## Initial Setup

### 1. Create Your Configuration File

Copy the example configuration:

```bash
# Copy the YAML configuration
cp config/app.yaml.example config/app.yaml

# Or use environment variables (recommended for production)
cp .env.example .env
```

### 2. Generate a Strong HMAC Secret

The HMAC secret is critical for API security. Generate a strong random secret:

**Using OpenSSL (Linux/macOS/WSL):**
```bash
openssl rand -base64 32
```

**Using PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Using Python:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 3. Update Configuration

Edit `config/app.yaml` and replace the placeholder:

```yaml
security:
  hmac_secret: "YOUR_GENERATED_SECRET_HERE"  # Replace this!
  max_body_size: 1048576
```

## MongoDB Security

### Local Development

For local testing, the default configuration is acceptable:

```yaml
mongo:
  uri: "mongodb://localhost:27017/?replicaSet=rs0"
  db: "cog_siem"
```

### Production Deployment

For production, use a secure MongoDB instance:

1. **MongoDB Atlas (Recommended)**
   ```yaml
   mongo:
     uri: "mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER_ADDRESS>/?retryWrites=true&w=majority"
     db: "cog_siem"
   ```

2. **Self-Hosted with Authentication**
   ```yaml
   mongo:
     uri: "mongodb://<username>:<password>@<host>:27017/cog_siem?authSource=admin&replicaSet=rs0&tls=true"
     db: "cog_siem"
   ```

### MongoDB Security Checklist

- [ ] Enable authentication (`--auth`)
- [ ] Use TLS/SSL for connections (`tls=true`)
- [ ] Create a dedicated database user with minimal privileges
- [ ] Enable replica set for change streams (required)
- [ ] Configure firewall rules to restrict access
- [ ] Regular backups of incident data
- [ ] Set appropriate retention policies

## Network Security

### Server Configuration

```yaml
server:
  ws_port: 8081       # WebSocket port
  rest_port: 8080     # REST API port
  bind_address: "0.0.0.0"  # Change for production!
```

**Bind Address Options:**
- `0.0.0.0` - Listen on all network interfaces (development/public)
- `127.0.0.1` - Localhost only (most secure)
- Specific IP - Listen on one interface only

### Firewall Rules

Configure your firewall to restrict access:

```bash
# Example: Allow only specific IPs to access the API
sudo ufw allow from 192.168.1.0/24 to any port 8080
sudo ufw allow from 192.168.1.0/24 to any port 8081
```

## API Authentication

### HMAC Signature Authentication

All ingest requests must include an HMAC-SHA256 signature:

```http
POST /ingest
Content-Type: application/json
X-Signature: base64(hmac_sha256(body, secret))

[event data]
```

### Generating Signatures (Python)

```python
import hmac
import hashlib
import base64
import json

secret = "your-hmac-secret"  # From config
body = json.dumps(events)

signature = base64.b64encode(
    hmac.new(secret.encode(), body.encode(), hashlib.sha256).digest()
).decode()

# Send with request
headers = {
    'Content-Type': 'application/json',
    'X-Signature': signature
}
```

## Production Deployment Checklist

Before deploying to production:

### Configuration
- [ ] Change `hmac_secret` to a strong random value
- [ ] Set `bind_address` appropriately for your network
- [ ] Review and adjust rate limits
- [ ] Set appropriate data retention policies
- [ ] Configure log rotation

### MongoDB
- [ ] Use MongoDB Atlas or secured self-hosted instance
- [ ] Enable authentication and TLS
- [ ] Create dedicated database user
- [ ] Configure replica set (required for change streams)
- [ ] Set up automated backups
- [ ] Enable audit logging

### Network
- [ ] Configure firewall rules
- [ ] Use reverse proxy (nginx/Apache) with HTTPS
- [ ] Set up rate limiting at proxy level
- [ ] Enable CORS appropriately
- [ ] Use VPN/private network if possible

### Application
- [ ] Review log level (`info` or `warn` for production)
- [ ] Set up log aggregation (ELK, Splunk, etc.)
- [ ] Configure monitoring and alerts
- [ ] Test incident correlation and clustering
- [ ] Verify WebSocket connections

### Security
- [ ] Run security audit of dependencies
- [ ] Set up intrusion detection
- [ ] Enable HIDS/HIPS on host
- [ ] Regular security updates
- [ ] Penetration testing

## Security Threats & Mitigations

| Threat | Mitigation |
|--------|-----------|
| **Spoofed Ingest** | HMAC signature verification |
| **Tampered Incidents** | Audit trail, MongoDB authentication |
| **Replay Attacks** | Timestamp validation, idempotency keys |
| **DoS/DDoS** | Rate limiting, queue bounds, resource limits |
| **Information Disclosure** | Field allowlists, PII redaction |
| **MITM Attacks** | TLS for MongoDB and HTTPS for API |
| **Unauthorized Access** | Firewall rules, network isolation |
| **SQL Injection** | MongoDB (NoSQL), parameterized queries |

## Monitoring & Auditing

### Audit Trail

All incident changes are automatically logged:

```bash
# Query audit log
db.audit_log.find().sort({timestamp: -1}).limit(100)
```

### Security Logs

Monitor `logs/siem.log` for:
- Failed authentication attempts
- Invalid HMAC signatures
- Rate limit violations
- MongoDB connection errors
- Unusual traffic patterns

### Metrics

Track security metrics in MongoDB:

```javascript
db.metrics_ts.find({
  metric: { $in: [
    "ingest_rejected_total",
    "auth_failures",
    "rate_limit_exceeded"
  ]}
}).sort({ts: -1})
```

## Security Incident Response

If you suspect a security breach:

1. **Immediate Actions**
   - Stop the SIEM service
   - Rotate HMAC secret immediately
   - Review audit logs for unauthorized access
   - Check MongoDB logs for suspicious queries

2. **Investigation**
   - Analyze recent incidents and events
   - Review network traffic logs
   - Check for data exfiltration
   - Verify data integrity

3. **Recovery**
   - Restore from clean backup if needed
   - Update all credentials
   - Patch any vulnerabilities
   - Strengthen security controls

4. **Prevention**
   - Document the incident
   - Update security procedures
   - Implement additional controls
   - Train team on lessons learned

## Additional Resources

- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)

## Reporting Security Issues

If you discover a security vulnerability, please email:
- **Do NOT** create a public GitHub issue
- Send details to: [your-security-email@example.com]
- Include steps to reproduce
- We'll respond within 48 hours

---

**Remember: Security is a process, not a product. Regularly review and update your security configurations.**
