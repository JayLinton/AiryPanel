# Inkflow

一个优雅的云端笔记应用，专注于纯粹的写作体验。

**🌐 在线体验：** https://inkflow.7rees.xyz

---

## ✨ 功能特性

### 📝 富文本编辑
- 标题（H1-H3）、粗体、斜体、下划线、删除线
- 代码块语法高亮（支持多种编程语言）
- 引用块、有序/无序列表、任务列表
- 图片插入（支持粘贴、拖拽、缩放、添加说明）
- 链接、文本高亮
- 浮动工具栏、命令菜单（输入 `/` 触发）
- 数学公式支持（LaTeX）

### 📋 笔记模板
- 8 个预设模板：日记、会议记录、待办清单、读书笔记、周报、项目文档、代码笔记
- 自定义模板保存和管理

### 🔗 双链引用
- 使用 `[[文档标题]]` 语法创建文档间链接
- 文档选择器快速插入引用
- 引用计数显示

### 🏷️ 标签系统
- 为文档添加多个标签
- 标签云筛选
- 按标签过滤文档

### 📂 文档管理
- 创建、编辑、删除文档
- 软删除（回收站）+ 永久删除
- 文档收藏功能
- 最近访问记录
- 搜索功能（标题+内容）

### 📊 数据统计
- 写作字数趋势图
- 文档数量统计
- 标签分析
- 创作日历（热力图）

### 🎯 专注模式
- 全屏无干扰写作
- 打字机模式（当前行自动居中）
- 控制栏自动隐藏

### 📤 导入导出
- 导出为 Markdown（带 frontmatter）
- 导出为 HTML
- 导入 Markdown 文件

### ⚡ 灵感时间轴
- 全局悬浮闪电按钮，一键捕获灵感
- 输入后自动落入当日 Markdown 时间轴文件
- 连续捕获模式，Enter 发送，Shift+Enter 换行
- 灵感页面：垂直时间轴 UI，按日期切换
- 支持 #标签、[[ ]] 双链引用

### ☁️ 云端同步
- 用户注册/登录（邮箱验证码）
- 数据云端存储
- 多设备同步
- 后台管理系统

### 🎨 界面特性
- 深色/浅色主题切换
- 侧边栏可调整宽度
- 状态栏（字数统计、保存状态）
- 快捷键支持
- 毛玻璃效果
- 用户头像上传

---

## 🚀 快速开始

### 在线使用（推荐）

直接访问 https://inkflow.7rees.xyz 即可使用。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/JayLinton/Inkflow.git
cd Inkflow

# 安装前端依赖
npm install --legacy-peer-deps

# 安装后端依赖
cd server && npm install --legacy-peer-deps && cd ..

# 启动后端
cd server && npm run dev &

# 启动前端
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建部署

```bash
# 构建前端
npm run build

# 部署到服务器
# 参考 DEPLOYMENT.md
```

---

## 📦 部署方式

### Vercel（前端）

```bash
npm i -g vercel
vercel --prod
```

### 自有服务器（完整版）

```bash
# 上传代码到服务器
scp -r dist server root@your-server:/var/www/inkflow/

# 在服务器上执行
cd /var/www/inkflow/server
npm install
pm2 start ecosystem.config.cjs
```

详细部署文档请参考 [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + N` | 新建笔记 |
| `Ctrl/Cmd + S` | 保存当前笔记 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `Ctrl/Cmd + B` | 切换侧边栏 / 加粗 |
| `Ctrl/Cmd + I` | 斜体 |
| `Ctrl/Cmd + U` | 下划线 |
| `Ctrl/Cmd + E` | 行内代码 |
| `Ctrl/Cmd + K` | 插入链接 |
| `Ctrl/Cmd + Shift + F` | 聚焦搜索框 |
| `Ctrl/Cmd + /` | 显示快捷键帮助 |
| `/` | 打开命令菜单 |
| `[[` | 插入双链引用 |

---

## 🛠️ 技术栈

**前端：**
- React 18 + TypeScript
- Vite 6
- TipTap（富文本编辑器）
- Tailwind CSS 3
- Lucide React（图标）
- KaTeX（数学公式）

**后端：**
- Node.js + Express
- lowdb（JSON 文件数据库）
- JWT 认证
- bcryptjs（密码加密）
- Resend（邮件发送）

---

## 📁 项目结构

```
├── src/                    # 前端源码
│   ├── api/               # API 客户端
│   ├── components/        # React 组件
│   ├── contexts/          # 状态管理
│   ├── data/              # 模板数据
│   ├── extensions/        # TipTap 扩展
│   └── utils/             # 工具函数
├── server/                 # 后端源码
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── middleware/    # 中间件
│   │   └── db/            # 数据库
│   └── data/              # 数据存储
├── dist/                   # 前端构建产物
└── public/                 # 静态资源
```

---

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建您的分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<p align="center">
  用 ❤️ 构建 | 本地优先，隐私至上
</p>
