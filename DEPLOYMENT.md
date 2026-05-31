# Inkflow 部署指南

## 🚀 快速部署（推荐）

### 方式一：Vercel（最简单）

1. 注册 [Vercel](https://vercel.com) 账号
2. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```
3. 在项目目录运行：
   ```bash
   vercel
   ```
4. 按提示操作，完成后会得到一个域名如 `inkflow.vercel.app`

**或者通过网页部署：**
1. 将代码推送到 GitHub
2. 登录 Vercel，点击 "New Project"
3. 导入你的 GitHub 仓库
4. 点击 "Deploy" 即可

---

### 方式二：Netlify

1. 注册 [Netlify](https://netlify.com) 账号
2. 安装 Netlify CLI：
   ```bash
   npm i -g netlify-cli
   ```
3. 构建项目：
   ```bash
   npm run build
   ```
4. 部署：
   ```bash
   netlify deploy --prod --dir=dist
   ```

**或者通过网页部署：**
1. 将代码推送到 GitHub
2. 登录 Netlify，点击 "Add new site"
3. 选择 "Import an existing project"
4. 选择你的 GitHub 仓库
5. 构建命令填 `npm run build`，发布目录填 `dist`
6. 点击 "Deploy site"

---

### 方式三：GitHub Pages

1. 将代码推送到 GitHub
2. 项目已配置好 `.github/workflows/deploy.yml`
3. 在 GitHub 仓库设置中：
   - 进入 Settings → Pages
   - Source 选择 "GitHub Actions"
4. 推送代码到 `main` 或 `master` 分支会自动部署

**注意：** GitHub Pages 不支持 SPA 路由，如果使用路由功能可能需要额外配置。

---

## 📦 本地构建

如果想自己托管静态文件：

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建产物在 dist 目录
# 可以用任何静态文件服务器托管
```

### 本地预览构建结果

```bash
npm run preview
```

### 使用其他静态服务器

```bash
# 使用 npx serve
npx serve dist

# 使用 Python
cd dist && python -m http.server 8000

# 使用 Node.js http-server
npx http-server dist
```

---

## 📱 PWA 安装

部署后，用户可以通过以下方式安装到桌面：

### Chrome / Edge
1. 访问网站
2. 点击地址栏右侧的安装图标
3. 点击 "安装"

### Safari (macOS)
1. 访问网站
2. 点击 "文件" → "添加到程序坞"

### 手机浏览器
1. 访问网站
2. 点击分享按钮
3. 选择 "添加到主屏幕"

---

## 🔧 自定义域名

### Vercel
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按提示配置 DNS

### Netlify
1. 在 Netlify 项目设置中点击 "Domain management"
2. 添加自定义域名
3. 配置 DNS 记录

---

## 📋 部署检查清单

- [x] 构建成功 (`npm run build`)
- [x] PWA 配置 (`manifest.json`, `sw.js`)
- [x] Service Worker 注册
- [x] 离线支持
- [x] 响应式设计
- [ ] 生成 PWA 图标（需要 192x192 和 512x512 的 PNG 图标）

---

## 🎯 推荐方案

**对于个人项目：** 使用 **Vercel** 或 **Netlify**
- 免费额度足够个人使用
- 自动 HTTPS
- 全球 CDN
- 自动部署（推送到 Git 自动更新）

**对于团队/企业：** 可以考虑
- 自建服务器 + Nginx
- 阿里云 OSS + CDN
- 腾讯云 COS + CDN
