请始终使用简体中文回答我的问题。所有代码注释、变量命名解释、技术文档都请用中文。

## 项目状态

查看 `PROJECT-STATUS.md` 了解项目当前状态、已完成工作和待办事项。

### 快速摘要

- **项目**: Inkflow 云端笔记应用
- **服务器**: http://124.220.174.240 (PM2 + Nginx)
- **最新功能**: 邮箱验证码注册 (Nodemailer + QQ 邮箱 SMTP)
- **同步代码**: 运行 `sync.bat`
- **查看状态**: `ssh root@124.220.174.240 "pm2 status"`

### 重要文件

- `PROJECT-STATUS.md` - 详细项目状态备忘录
- `sync.bat` - 一键同步脚本
- `server/src/utils/email.ts` - 邮件发送模块
- `server/.env` - 环境变量配置