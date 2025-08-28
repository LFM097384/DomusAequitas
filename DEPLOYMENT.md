# 🚀 部署指南 / Deployment Guide

## GitHub Pages 部署

### 方法一：自动部署 (推荐)

1. **Fork 或上传项目到 GitHub**
   ```bash
   git clone https://github.com/your-username/room-rent-allocation.git
   cd room-rent-allocation
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **启用 GitHub Pages**
   - 进入项目的 GitHub 页面
   - 点击 `Settings` -> `Pages`
   - Source 选择 `GitHub Actions`
   - 系统会自动使用 `.github/workflows/deploy.yml` 配置

3. **访问网站**
   - 部署完成后访问: `https://your-username.github.io/your-repo-name`

### 方法二：手动部署

1. **准备文件**
   ```bash
   mkdir gh-pages
   cp web-index.html gh-pages/index.html
   cp styles.css gh-pages/
   cp i18n.js gh-pages/
   cp renderer.js gh-pages/
   cp web-main.js gh-pages/
   ```

2. **推送到 gh-pages 分支**
   ```bash
   cd gh-pages
   git init
   git add .
   git commit -m "Deploy to GitHub Pages"
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push origin HEAD:gh-pages --force
   ```

## 其他静态托管平台

### Netlify
1. 注册 [Netlify](https://www.netlify.com/)
2. 连接 GitHub 仓库
3. 构建设置:
   - Build command: `cp web-index.html index.html`
   - Publish directory: `/`

### Vercel
1. 注册 [Vercel](https://vercel.com/)
2. 导入 GitHub 项目
3. 系统自动检测并部署

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# 选择 public 目录，复制 web 文件到 public/
firebase deploy
```

## 本地开发

### 简单 HTTP 服务器
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### 完整开发环境
```bash
# 安装依赖
npm install

# 开发模式 (Electron)
npm run dev

# 构建 Web 版本
npm run build:web

# 构建 Electron 应用
npm run build:electron
```

## 配置说明

### 环境变量
无需配置环境变量，纯前端应用。

### 自定义域名
1. 在项目根目录创建 `CNAME` 文件
2. 添加你的域名: `your-domain.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 `your-username.github.io`

### HTTPS 配置
GitHub Pages 自动提供 HTTPS，无需额外配置。

## 故障排除

### 常见问题

1. **页面空白**
   - 检查浏览器控制台错误
   - 确认所有资源文件路径正确

2. **功能异常**
   - 确认使用 `web-index.html` 而不是 `index.html`
   - 检查 `web-main.js` 是否正确加载

3. **PDF 导出失败**
   - 确认 jsPDF 库加载成功
   - 检查浏览器是否支持 html2canvas

### 调试模式
在浏览器控制台运行:
```javascript
// 启用调试日志
window.DEBUG = true;

// 检查 i18n 状态
console.log(window.i18n.currentLang);

// 检查算法功能
window.electronAPI.calculateAllocation(testData);
```

## 更新部署

### 自动更新
推送到 main 分支即可自动部署:
```bash
git add .
git commit -m "Update features"
git push origin main
```

### 手动更新
1. 更新代码
2. 重新复制文件到部署目录
3. 推送到 gh-pages 分支

## 监控与分析

### GitHub Pages 状态
- 访问: `https://github.com/your-username/your-repo-name/deployments`
- 查看部署历史和状态

### 添加 Google Analytics
在 `web-index.html` 的 `<head>` 中添加:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 安全考虑

### Content Security Policy
可以在 `web-index.html` 中添加 CSP 头:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net;">
```

### HTTPS Only
GitHub Pages 默认强制 HTTPS，确保数据传输安全。

---

**部署成功后，你的房间分配系统就可以在线使用了！** 🎉
