#!/bin/bash

# Inkflow 一键部署脚本
# 使用方法：将此脚本上传到服务器后执行
# chmod +x deploy.sh && ./deploy.sh

set -e

# Inkflow ASCII 艺术
show_banner() {
    echo ""
    echo "  ██╗███╗   ██╗██╗  ██╗███████╗██╗      ██████╗ ██╗    ██╗"
    echo "  ██║████╗  ██║██║ ██╔╝██╔════╝██║     ██╔═══██╗██║    ██║"
    echo "  ██║██╔██╗ ██║█████╔╝ █████╗  ██║     ██║   ██║██║ █╗ ██║"
    echo "  ██║██║╚██╗██║██╔═██╗ ██╔══╝  ██║     ██║   ██║██║███╗██║"
    echo "  ██║██║ ╚████║██║  ██╗██║     ███████╗╚██████╔╝╚███╔███╔╝"
    echo "  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝"
    echo ""
    echo "  ╔══════════════════════════════════════════════════════════╗"
    echo "  ║          优雅的云端笔记应用 · 本地优先 · 隐私至上          ║"
    echo "  ╚══════════════════════════════════════════════════════════╝"
    echo ""
}

show_banner
echo "🚀 开始部署 Inkflow..."

# 配置
APP_NAME="inkflow"
APP_DIR="/var/www/$APP_NAME"
NODE_VERSION="20"

# 1. 安装 Node.js（如果没有）
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js 版本: $(node -v)"

# 2. 安装 PM2（如果没有）
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 3. 安装 Nginx（如果没有）
if ! command -v nginx &> /dev/null; then
    echo "📦 安装 Nginx..."
    sudo apt-get install -y nginx
fi

# 4. 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 5. 复制文件（假设当前目录有构建好的文件）
echo "📋 复制文件..."
cp -r dist/* $APP_DIR/ 2>/dev/null || echo "⚠️  请先运行 npm run build"
cp -r server $APP_DIR/
cp package.json $APP_DIR/ 2>/dev/null || true

# 6. 安装后端依赖
echo "📦 安装后端依赖..."
cd $APP_DIR/server
npm install --production

# 7. 创建数据目录
mkdir -p $APP_DIR/server/data

# 8. 配置环境变量
if [ ! -f $APP_DIR/server/.env ]; then
    echo "⚙️  创建环境变量文件..."
    cat > $APP_DIR/server/.env << EOF
PORT=3000
JWT_SECRET=$(openssl rand -hex 32)
ADMIN_PASSWORD=admin123
EOF
    echo "⚠️  请修改 $APP_DIR/server/.env 中的 ADMIN_PASSWORD"
fi

# 9. 启动后端服务
echo "🚀 启动后端服务..."
cd $APP_DIR/server
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start npm --name $APP_NAME -- start
pm2 save

# 10. 配置 Nginx
echo "⚙️  配置 Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root $APP_DIR;
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # 限制上传大小
    client_max_body_size 10M;
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重启 Nginx
sudo nginx -t && sudo systemctl restart nginx

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "你的服务器IP")

echo ""
echo "  ╔════════════════════════════════════════════════════════════╗"
echo "  ║                                                            ║"
echo "  ║   ✅  Inkflow 部署成功！                                    ║"
echo "  ║                                                            ║"
echo "  ║   📍 访问地址:  http://$SERVER_IP"
echo "  ║   📍 后台管理:  http://$SERVER_IP/admin"
echo "  ║   📍 管理密码:  admin123                                    ║"
echo "  ║                                                            ║"
echo "  ║   ⚠️  请务必修改：                                          ║"
echo "  ║      1. 后台管理密码                                        ║"
echo "  ║      2. 配置域名和 SSL 证书                                 ║"
echo "  ║                                                            ║"
echo "  ║   📋 常用命令：                                             ║"
echo "  ║      pm2 status          - 查看服务状态                     ║"
echo "  ║      pm2 logs inkflow    - 查看日志                         ║"
echo "  ║      pm2 restart inkflow - 重启服务                         ║"
echo "  ║                                                            ║"
echo "  ╚════════════════════════════════════════════════════════════╝"
echo ""

# 再次显示 ASCII 艺术
show_banner
