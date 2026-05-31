@echo off

echo.
echo ========================================
echo    Inkflow Server Init Tool
echo ========================================
echo.

set SERVER_IP=124.220.174.240
set SERVER_USER=root

echo Connecting to server...
echo.

ssh %SERVER_USER%@%SERVER_IP% "bash -s" << 'CMDS'
echo "[1/5] Creating directories..."
mkdir -p /var/www/inkflow
cd /var/www/inkflow

echo "[2/5] Cloning code..."
if [ ! -d ".git" ]; then
    git clone https://github.com/JayLinton/Inkflow.git temp
    mv temp/* temp/.* . 2>/dev/null
    rm -rf temp
else
    echo "[OK] Git repo exists"
fi

echo "[3/5] Pulling latest code..."
git pull origin master

echo "[4/5] Installing dependencies..."
cd server
npm install --production

echo "[5/5] Building and starting..."
npm run build

# Create .env if not exists
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
PORT=3000
JWT_SECRET=inkflow-secret-key-change-in-production-2026
ADMIN_PASSWORD=admin123
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=1063750098@qq.com
SMTP_PASS=your_auth_code_here
ENVEOF
    echo "[!] Please edit /var/www/inkflow/server/.env"
    echo "[!] Add your QQ mail auth code to SMTP_PASS"
fi

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Start service
pm2 delete inkflow 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "Server init complete!"
pm2 status
CMDS

echo.
echo ========================================
echo    Server Init Complete!
echo ========================================
echo.
echo Visit: http://%SERVER_IP%
echo.
echo Next steps:
echo   1. SSH to server: ssh %SERVER_USER%@%SERVER_IP%
echo   2. Edit config: nano /var/www/inkflow/server/.env
echo   3. Add QQ mail auth code to SMTP_PASS
echo   4. Restart: pm2 restart inkflow
echo.
echo Then run sync.bat to sync updates.
echo.
pause
