# Inkflow 项目状态备忘录

> **最后更新**: 2026-06-01
> **当前版本**: 0.3.6
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

### 1. 灵感时间轴功能 (v0.3.0 - v0.3.6)
- ✅ 全局悬浮闪电按钮（编辑区右下角，sticky 定位）
- ✅ 灵感捕获输入模态层（Enter 发送，Shift+Enter 换行）
- ✅ 连续捕获模式（发送后保持打开）
- ✅ 数据存储：复用笔记系统，标题格式 `DailyStream:YYYY-MM-DD`
- ✅ 灵感页面：左侧时间轴内容 + 右侧日期列表（与大纲栏同宽）
- ✅ 磨砂圆形关闭按钮（灵感页面右上角）
- ✅ 点击侧边栏笔记自动退出灵感页面
- ✅ Toast 通知组件
- ✅ 时间轴笔记在侧边栏中隐藏

### 2. 邮箱验证码功能
- ✅ 使用 Resend 发送验证邮件
- ✅ 自定义域名 `inkflow.7rees.xyz`
- ✅ 极简黑白风格邮件模板（纯 HTML+CSS，兼容所有邮件客户端）

### 3. 服务器部署
- ✅ PM2 进程管理（ecosystem.config.cjs）
- ✅ Nginx 反向代理
- ✅ SSH 免密登录

### 4. 一键同步脚本
- ✅ `sync.bat` - 同步代码到服务器（上传到 `/var/www/inkflow/dist/`）

---

## 🔄 当前状态

**服务器**: 运行中 (PM2)
**最新代码**: 已同步并编译
**灵感时间轴**: 已可用
**版本**: 0.3.6

---

## ⏳ 待办事项

- [ ] 配置 SSL 证书 (HTTPS)
- [ ] 配置域名
- [ ] 优化前端 UI/UX
- [ ] 时间轴内容支持在编辑器中渲染（Markdown → TipTap）
- [ ] 图片粘贴上传功能

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

1. **版本号规则**: MAJOR.MINOR.PATCH，每次更新必须递增
   - MAJOR: 不兼容的 API 修改或重大架构重构
   - MINOR: 向下兼容地新增功能
   - PATCH: 向下兼容的问题修复（bugfix）
2. **闪电按钮定位**: 使用 sticky 定位在 Editor 编辑区内，不要用 fixed（会被 transition-opacity 影响）
3. **时间轴笔记**: content 是纯 Markdown，不是 TipTap JSON，Editor 解析时需要 try-catch
4. **同步**: 每次修改后运行 `sync.bat`
5. **环境变量**: 服务器 `/var/www/inkflow/server/.env`

---

## 📁 关键文件

```
src/components/InspirationFab.tsx   # 灵感捕获按钮 + 输入模态层
src/components/TimelineView.tsx     # 灵感页面（时间轴视图）
src/components/Toast.tsx            # Toast 通知组件
src/utils/timeline.ts              # 时间轴工具函数
server/src/utils/email.ts          # 邮件发送 (Resend)
server/.env                        # 环境变量
sync.bat                           # 一键同步脚本
ecosystem.config.cjs               # PM2 配置
```

---

## 🎯 下次启动时

1. 检查服务器: `ssh root@124.220.174.240 "pm2 status"`
2. 测试功能: 访问 http://124.220.174.240
3. 如需同步: 运行 `sync.bat`

---

**备忘录结束**
