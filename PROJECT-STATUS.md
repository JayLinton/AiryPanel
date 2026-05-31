# Inkflow 项目状态备忘录

> **最后更新**: 2026-05-31
> **用途**: 下次启动 Claude Code 时快速了解项目状态

---

## 📋 项目概述

- **项目名称**: Inkflow - 云端笔记应用
- **技术栈**: React 18 + TypeScript + Vite / Node.js + Express + lowdb
- **在线地址**: http://124.220.174.240
- **GitHub**: https://github.com/JayLinton/Inkflow.git
- **服务器**: 124.220.174.240 (root)

---

## ✅ 已完成的工作

### 1. 邮箱验证码功能
- ✅ 实现邮箱验证码注册
- ✅ 使用 Nodemailer + QQ 邮箱 SMTP (替代 Resend)
- ✅ QQ SMTP: smtp.qq.com:465, 发件人: 1063750098@qq.com
- ✅ 服务器 .env 已配置

### 2. 邮件模板
- ✅ 极简黑白风格设计
- ✅ 与网站风格一致
- ✅ 表格布局兼容所有邮件客户端

### 3. 服务器部署
- ✅ PM2 进程管理
- ✅ Nginx 反向代理
- ✅ SSH 免密登录

### 4. 一键同步脚本
- ✅ `sync.bat` - 同步代码到服务器
- ✅ `setup-ssh.bat` - SSH 配置
- ✅ `init-server.bat` - 服务器初始化

---

## 🔄 当前状态

**服务器**: 运行中 (PM2)
**最新代码**: 已同步并编译
**验证码功能**: 已可用

---

## ⏳ 待办事项

- [ ] 测试注册流程完整性
- [ ] 配置 SSL 证书 (HTTPS)
- [ ] 配置域名
- [ ] 优化前端 UI/UX
- [ ] 添加更多笔记功能

---

## 🔧 常用命令

```bash
# 查看服务器状态
ssh root@124.220.174.240 "pm2 status"

# 查看日志
ssh root@124.220.174.240 "pm2 logs inkflow"

# 重启服务
ssh root@124.220.174.240 "pm2 restart inkflow"

# 同步代码
双击 sync.bat
```

---

## ⚠️ 注意事项

1. **验证码**: 存储在内存中，服务器重启会丢失
2. **同步**: 每次修改后运行 `sync.bat`
3. **QQ 邮箱**: 使用授权码，不是登录密码
4. **环境变量**: 服务器 `/var/www/inkflow/server/.env`

---

## 📁 关键文件

```
server/src/utils/email.ts     # 邮件发送 (Nodemailer + QQ SMTP)
server/.env                   # 环境变量
sync.bat                      # 一键同步脚本
```

---

## 🎯 下次启动时

1. 检查服务器: `ssh root@124.220.174.240 "pm2 status"`
2. 测试注册: 访问 http://124.220.174.240
3. 如需同步: 运行 `sync.bat`

---

**备忘录结束**
