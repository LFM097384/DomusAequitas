const fs = require('fs');
const path = require('path');

// 创建简单的SVG图标
const createSVGIcon = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2196f3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="256" height="256" rx="32" fill="url(#bg)"/>
  
  <!-- 房屋图标 -->
  <g transform="translate(64,80)">
    <!-- 屋顶 -->
    <polygon points="64,20 20,60 108,60" fill="white" opacity="0.9"/>
    <!-- 房屋主体 -->
    <rect x="30" y="60" width="68" height="60" fill="white" opacity="0.8"/>
    <!-- 门 -->
    <rect x="45" y="85" width="20" height="35" fill="#1976d2"/>
    <!-- 窗户 -->
    <rect x="70" y="75" width="15" height="15" fill="#1976d2"/>
  </g>
  
  <!-- 文字 -->
  <text x="128" y="180" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">房租</text>
  <text x="128" y="210" text-anchor="middle" fill="white" font-family="Arial" font-size="20">分配</text>
</svg>`;
    
    fs.writeFileSync(path.join(__dirname, 'assets', 'icon.svg'), svgContent);
    console.log('✅ 已创建 SVG 图标');
};

// 创建ICO占位符（实际构建时会自动转换）
const createIconPlaceholder = () => {
    // 创建一个简单的文本文件作为占位符
    const placeholder = `# 图标占位符

这个文件是图标的占位符。在实际构建时，electron-builder会自动处理图标转换。

建议图标规格:
- Windows ICO: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- macOS ICNS: 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16
- Linux PNG: 512x512

如果有专业的图标文件，请替换 assets/ 目录下的相应文件:
- assets/icon.ico (Windows)
- assets/icon.icns (macOS)  
- assets/icon.png (Linux)
`;
    
    fs.writeFileSync(path.join(__dirname, 'assets', 'icon-readme.txt'), placeholder);
};

// 检查和创建必要的构建文件
const setupBuild = () => {
    const assetsDir = path.join(__dirname, 'assets');
    
    // 确保 assets 目录存在
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
        console.log('📁 已创建 assets 目录');
    }
    
    // 创建 SVG 图标
    createSVGIcon();
    
    // 创建图标说明
    createIconPlaceholder();
    
    // 检查必要文件
    const requiredFiles = ['LICENSE.txt', 'main.js', 'index.html', 'package.json'];
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
    
    if (missingFiles.length > 0) {
        console.log('❌ 缺少必要文件:', missingFiles.join(', '));
        return false;
    }
    
    console.log('✅ 构建环境检查完成');
    console.log('📦 现在可以运行构建命令了:');
    console.log('   npm run build:win    - 构建 Windows 版本');
    console.log('   npm run build        - 构建所有平台版本');
    
    return true;
};

// 运行设置
if (require.main === module) {
    setupBuild();
}

module.exports = { setupBuild };
