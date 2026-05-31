# Inkflow 快速参考

## 🚀 快速开始

```bash
# 查看服务器状态
ssh root@124.220.174.240 "pm2 status"

# 同步代码到服务器
双击 sync.bat

# 查看日志
ssh root@124.220.174.240 "pm2 logs inkflow"

# 重启服务
ssh root@124.220.174.240 "pm2 restart inkflow"
```

## 📍 重要地址

- **网站**: http://124.220.174.240
- **后台**: http://124.220.174.240/admin (密码: admin123)
- **GitHub**: https://github.com/JayLinton/Inkflow.git

## 🔧 配置信息

- **服务器**: 124.220.174.240 (root)
- **PM2 服务**: inkflow
- **SMTP**: QQ 邮箱 (1063750098@qq.com)
- **数据库**: lowdb (JSON 文件)

## 📝 最近完成

- ✅ 邮箱验证码注册功能
- ✅ QQ 邮箱 SMTP 配置
- ✅ 极简黑白风格邮件模板
- ✅ 一键同步脚本

## ⏳ 待办事项

- [ ] 测试完整注册流程
- [ ] 配置 SSL 证书
- [ ] 配置域名
- [ ] 优化 UI/UX

## ⚠️ 注意

- 验证码存储在内存中，重启会丢失
- 修改代码后运行 `sync.bat`
- QQ 邮箱使用授权码，不是登录密码
