# Inkflow Server Sync Guide

## Quick Start (3 Steps)

### Step 1: Setup SSH (One-time)
```
Double-click: setup-ssh.bat
Enter server password when prompted.
```

### Step 2: Init Server (One-time)
```
Double-click: init-server.bat
Wait for automatic setup.
```

### Step 3: Configure Email
```bash
# SSH to server
ssh root@124.220.174.240

# Edit config file
nano /var/www/inkflow/server/.env

# Change SMTP_PASS to your QQ mail auth code
# Save: Ctrl+X, Y, Enter

# Restart service
pm2 restart inkflow
```

### Daily Sync
```
Double-click: sync.bat
```

---

## Scripts

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `setup-ssh.bat` | Setup SSH passwordless login | Once |
| `init-server.bat` | Initialize server environment | Once |
| `sync.bat` | One-click sync updates | Every change |

---

## Manual Commands

### Check server status
```bash
ssh root@124.220.174.240 "pm2 status"
```

### View logs
```bash
ssh root@124.220.174.240 "pm2 logs inkflow"
```

### Restart service
```bash
ssh root@124.220.174.240 "pm2 restart inkflow"
```

### Edit config
```bash
ssh root@124.220.174.240
nano /var/www/inkflow/server/.env
```

---

## Troubleshooting

### Q: Sync fails?
A: Check:
1. Server is accessible
2. SSH key is configured
3. Disk space on server

### Q: How to rollback?
A: On server:
```bash
ssh root@124.220.174.240
cd /var/www/inkflow
git log --oneline
git checkout <version>
cd server
npm install --production
npm run build
pm2 restart inkflow
```

### Q: View real-time logs?
A: On server:
```bash
ssh root@124.220.174.240 "pm2 logs inkflow --lines 50"
```
