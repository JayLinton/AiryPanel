@echo off

echo.
echo ========================================
echo    Inkflow Sync Tool
echo ========================================
echo.

set SERVER_IP=124.220.174.240
set SERVER_USER=root

echo [1/4] Building frontend...
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
echo [OK] Frontend built
echo.

echo [2/4] Syncing to server...

:: Upload frontend
scp -r dist/* %SERVER_USER%@%SERVER_IP%:/var/www/inkflow/dist/

:: Upload backend source
scp -r server/src server/package.json server/package-lock.json server/tsconfig.json server/ecosystem.config.js %SERVER_USER%@%SERVER_IP%:/var/www/inkflow/server/

echo [OK] Files uploaded
echo.

echo [3/4] Building backend on server...
ssh %SERVER_USER%@%SERVER_IP% "cd /var/www/inkflow/server && npm install && npm run build"
if errorlevel 1 (
    echo [ERROR] Backend build failed
    pause
    exit /b 1
)
echo [OK] Backend built
echo.

echo [4/4] Restarting server...
ssh %SERVER_USER%@%SERVER_IP% "pm2 restart inkflow"
if errorlevel 1 (
    echo [ERROR] Server restart failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Sync Complete!
echo ========================================
echo.
echo Visit: http://%SERVER_IP%
echo.
echo Commands:
echo   View logs: ssh %SERVER_USER%@%SERVER_IP% "pm2 logs inkflow"
echo   Restart:   ssh %SERVER_USER%@%SERVER_IP% "pm2 restart inkflow"
echo   Status:    ssh %SERVER_USER%@%SERVER_IP% "pm2 status"
echo.
pause
