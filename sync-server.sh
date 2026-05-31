#!/bin/bash

# Inkflow 服务器同步脚本
# 用法：./sync-server.sh <服务器IP> [用户名]

set -e

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 请提供服务器 IP 地址"
    echo "用法: ./sync-server.sh <服务器IP> [用户名]"
    echo "示例: ./sync-server.sh 192.168.1.100 root"
    exit 1
fi

SERVER_IP=$1
SERVER_USER=${2:-root}
APP_DIR="/var/www/inkflow"

echo "🚀 开始同步到服务器 $SERVER_IP..."

# 1. 构建前端
echo "📦 构建前端..."
npm run build

# 2. 同步后端代码
echo "📋 同步后端代码..."
rsync -avz --delete \
    server/src \
    server/package.json \
    server/package-lock.json \
    server/tsconfig.json \
    server/ecosystem.config.js \
    $SERVER_USER@$SERVER_IP:$APP_DIR/server/

# 3. 同步前端构建产物
echo "📋 同步前端文件..."
rsync -avz --delete \
    dist/ \
    $SERVER_USER@$SERVER_IP:$APP_DIR/

# 4. 在服务器上安装依赖并重启
echo "🔧 在服务器上执行更新..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /var/www/inkflow/server

# 安装依赖
npm install --production

# 重新构建后端（如果需要）
# npm run build

# 重启 PM2 服务
pm2 restart inkflow

# 查看状态
pm2 status
EOF

echo ""
echo "✅ 同步完成！"
echo ""
echo "📋 常用命令："
echo "   查看日志: ssh $SERVER_USER@$SERVER_IP 'pm2 logs inkflow'"
echo "   重启服务: ssh $SERVER_USER@$SERVER_IP 'pm2 restart inkflow'"
echo "   查看状态: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
