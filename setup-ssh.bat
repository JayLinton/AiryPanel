@echo off

echo.
echo ========================================
echo    Inkflow SSH Setup Tool
echo ========================================
echo.

set SERVER_IP=124.220.174.240
set SERVER_USER=root

echo [1/3] Checking SSH key...
if exist "%USERPROFILE%\.ssh\id_rsa.pub" (
    echo [OK] SSH key found
) else (
    echo [!] No SSH key found, generating...
    ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
    if errorlevel 1 (
        echo [ERROR] Failed to generate key
        pause
        exit /b 1
    )
    echo [OK] SSH key generated
)
echo.

echo [2/3] Uploading public key to server...
echo Please enter your server password:
type "%USERPROFILE%\.ssh\id_rsa.pub" | ssh %SERVER_USER%@%SERVER_IP% "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

if errorlevel 1 (
    echo [ERROR] Failed to upload key
    echo Please check your server password
    pause
    exit /b 1
)
echo [OK] Public key uploaded
echo.

echo [3/3] Testing passwordless login...
ssh -o BatchMode=yes %SERVER_USER%@%SERVER_IP% "echo 'SSH passwordless login OK!'" 2>nul
if errorlevel 1 (
    echo [ERROR] Passwordless login test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo    SSH Setup Complete!
echo ========================================
echo.
echo Now you can run sync.bat to sync updates.
echo.
pause
