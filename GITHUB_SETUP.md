# GitHub Repository Setup Guide

This guide helps you prepare AegisMind SIEM for deployment on GitHub.

## Before You Push to GitHub

### 1. Verify Sensitive Files Are Protected

Check that these files are in `.gitignore`:

```bash
# View .gitignore
cat .gitignore | grep -E "(app.yaml|.env|secrets)"
```

Should include:
- `config/app.yaml`
- `.env`
- `.env.local`
- `.env.production`
- `secrets/`
- `credentials/`

### 2. Remove Any Committed Secrets

If you've already committed `config/app.yaml` or other secrets:

```bash
# Remove from Git history
git rm --cached config/app.yaml
git rm --cached .env

# Commit the removal
git commit -m "Remove sensitive configuration files"
```

### 3. Verify Example Files Exist

Ensure these template files are present and will be committed:

```bash
ls -la config/app.yaml.example
ls -la .env.example
ls -la SECURITY.md
ls -la DEPLOYMENT_GUIDE.md
```

### 4. Check for Other Sensitive Data

Search for potential secrets in your codebase:

```bash
# Search for common secret patterns
git grep -i "password"
git grep -i "api_key"
git grep -i "secret"
git grep -i "token"

# Review results - make sure no real secrets are found
```

## Creating Your GitHub Repository

### Option 1: New Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. **Do NOT initialize with README** (we already have one)
3. Copy the repository URL

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/AegisMind.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option 2: Forking (if this is a fork)

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/AegisMind.git
cd AegisMind
```

## Repository Configuration

### Add Repository Description

On GitHub, go to your repository settings and add:

**Description:**
> Production-grade real-time SIEM system with intelligent event clustering, incident correlation, and live WebSocket updates. Built with modern C++20 and MongoDB.

**Topics/Tags:**
- `siem`
- `security`
- `cybersecurity`
- `cpp`
- `mongodb`
- `websocket`
- `real-time`
- `incident-response`
- `threat-detection`
- `cpp20`

### Set Up Branch Protection (Optional but Recommended)

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Include administrators

## Update Repository-Specific Information

### Update README.md

Replace placeholder URLs:

```bash
# Search for placeholders
grep -r "YOUR_USERNAME" .
grep -r "your-email@example.com" .
```

Update these files:
- `README.md` - Update clone URLs
- `DEPLOYMENT_GUIDE.md` - Update clone URLs
- `SECURITY.md` - Update security contact email

### Example changes:

```markdown
# In DEPLOYMENT_GUIDE.md
git clone https://github.com/YOUR_USERNAME/AegisMind.git

# Change to:
git clone https://github.com/YourActualUsername/AegisMind.git
```

## GitHub Security Features

### Enable Security Advisories

1. Go to Settings → Security & analysis
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning (if available)

### Add Security Policy

Create `.github/SECURITY.md`:

```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email:
[your-security-email@example.com]

**Do NOT create a public GitHub issue for security vulnerabilities.**

We'll respond within 48 hours.
```

## Add GitHub Actions (Optional)

Create `.github/workflows/build.yml` for CI/CD:

```yaml
name: Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up vcpkg
      run: |
        git clone https://github.com/Microsoft/vcpkg.git
        cd vcpkg
        ./bootstrap-vcpkg.sh  # or .bat on Windows
    
    - name: Configure CMake
      run: |
        cmake -S . -B build \
          -DCMAKE_TOOLCHAIN_FILE=./vcpkg/scripts/buildsystems/vcpkg.cmake
    
    - name: Build
      run: cmake --build build
    
    - name: Test
      run: cd build && ctest --output-on-failure
```

## Add Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug or issue
title: '[BUG] '
labels: bug
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. ...
2. ...

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g., Windows 10, Ubuntu 22.04]
- MongoDB Version: [e.g., 7.0]
- Compiler: [e.g., MSVC 2022, GCC 11]

**Logs**
```
Paste relevant logs here
```
```

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest a new feature
title: '[FEATURE] '
labels: enhancement
---

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution**
What you want to happen.

**Alternatives considered**
Other solutions you've considered.

**Additional context**
Any other information.
```

## Pre-Push Checklist

Before pushing to GitHub:

- [ ] All sensitive data removed from Git history
- [ ] `.gitignore` includes `config/app.yaml` and `.env`
- [ ] Example configuration files present (`.example` versions)
- [ ] SECURITY.md created with your contact info
- [ ] DEPLOYMENT_GUIDE.md updated with correct URLs
- [ ] README.md has prominent security warnings
- [ ] No hardcoded secrets in code
- [ ] License file present and correct (MIT)
- [ ] CONTRIBUTING.md has your guidelines
- [ ] All documentation is up to date

## Push to GitHub

```bash
# Stage all changes
git add .

# Commit
git commit -m "Prepare for GitHub deployment with security configurations"

# Push
git push -u origin main
```

## After Publishing

### Update Your Profile README (Optional)

Add to your GitHub profile:

```markdown
## AegisMind SIEM

Production-grade real-time Security Information and Event Management system.

[View Repository →](https://github.com/YOUR_USERNAME/AegisMind)
```

### Share Your Project

- Add to your LinkedIn
- Tweet about it
- Submit to awesome lists
- Share on Reddit (r/netsec, r/cybersecurity)
- Post on dev.to or Medium

### Monitor Your Repository

- Watch for security advisories
- Review pull requests
- Respond to issues
- Keep dependencies updated

## Ongoing Security Maintenance

### Regular Security Checks

```bash
# Check for hardcoded secrets
git secrets --scan

# Audit dependencies (if using npm for UI)
cd ui && npm audit

# Update dependencies
cd vcpkg && git pull
./vcpkg upgrade
```

### Keep Documentation Updated

When you make changes:
- Update CHANGELOG.md
- Update version numbers
- Tag releases: `git tag v1.0.0 && git push --tags`
- Write release notes

## Emergency: Secret Leaked

If you accidentally commit a secret:

1. **Rotate the secret immediately**
   - Generate new HMAC secret
   - Update MongoDB passwords
   - Revoke any API keys

2. **Remove from Git history**
   ```bash
   # Use BFG Repo Cleaner
   bfg --delete-files config/app.yaml
   git push --force
   ```

3. **Notify affected parties**
   - Security team
   - Users if applicable
   - GitHub Security (for scanning)

4. **Document the incident**
   - What was leaked
   - How it was addressed
   - Prevention measures

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Git Secrets Prevention](https://git-secret.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Remember: Once code is pushed to GitHub, assume it's public forever, even if the repository is private.**
