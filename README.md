# Inkflow

一个优雅的本地笔记应用，专注于纯粹的写作体验。

**🌐 在线体验：** https://inkflow-lemon.vercel.app

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
- GitHub 风格贡献图

### 🎯 专注模式
- 全屏无干扰写作
- 打字机模式（当前行自动居中）
- 控制栏自动隐藏

### 📤 导入导出
- 导出为 Markdown（带 frontmatter）
- 导出为 HTML
- 导入 Markdown 文件
- 数据备份和恢复

### 🎨 界面特性
- 深色/浅色主题切换
- 侧边栏可调整宽度
- 封面图/渐变色
- 状态栏（字数统计、保存状态）
- 快捷键支持
- 毛玻璃效果

### 💾 数据安全
- 本地存储（IndexedDB）
- 自动保存
- 内存降级方案
- 错误提示和恢复建议

---

## 🚀 快速开始

### 在线使用（推荐）

直接访问 https://inkflow-lemon.vercel.app 即可使用。

**安装到桌面：**
1. 用 Chrome / Edge 打开链接
2. 点击地址栏右侧的安装图标
3. 点击"安装"

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/JayLinton/Inkflow.git
cd Inkflow

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 📦 部署方式

### Vercel（推荐）

```bash
npm i -g vercel
vercel --prod
```

或访问 [vercel.com](https://vercel.com) 导入 GitHub 仓库。

### Netlify

```bash
npm run build
# 拖拽 dist 文件夹到 netlify.com/drop
```

### GitHub Pages

推送代码到 GitHub，在仓库 Settings → Pages 中启用。

### Docker

```bash
docker build -t inkflow .
docker run -p 3000:80 inkflow
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

- **前端框架**: [React 18](https://react.dev/)
- **构建工具**: [Vite 6](https://vitejs.dev/)
- **类型系统**: [TypeScript](https://www.typescriptlang.org/)
- **富文本编辑器**: [TipTap](https://tiptap.dev/) (基于 ProseMirror)
- **样式方案**: [Tailwind CSS 3](https://tailwindcss.com/)
- **本地存储**: [Dexie](https://dexie.org/) (IndexedDB)
- **图标库**: [Lucide React](https://lucide.dev/)
- **数学公式**: [KaTeX](https://katex.org/)

---

## 📁 项目结构

```
src/
├── assets/            # 静态资源
├── components/        # React 组件
│   ├── Editor.tsx     # 主编辑器
│   ├── Sidebar.tsx    # 侧边栏
│   ├── BlockMenu.tsx  # 块操作菜单
│   ├── FocusMode.tsx  # 专注模式
│   ├── StatsPanel.tsx # 数据统计
│   └── ...
├── contexts/          # React Context
│   └── AppContext.tsx # 应用状态管理
├── data/              # 数据
│   └── templates.ts   # 笔记模板
├── db/                # 数据库
│   └── database.ts   # Dexie 数据库配置
├── extensions/        # TipTap 扩展
│   ├── WikiLink.ts   # 双链扩展
│   └── ImageResize.ts # 图片缩放扩展
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
├── App.tsx            # 应用主组件
├── main.tsx           # 入口文件
└── index.css          # 全局样式
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

## 🙏 致谢

- [TipTap](https://tiptap.dev/) - 优秀的富文本编辑器框架
- [Lucide](https://lucide.dev/) - 精美的图标库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [KaTeX](https://katex.org/) - 快速的数学公式渲染

---

<p align="center">
  用 ❤️ 构建 | 本地优先，隐私至上
</p>
