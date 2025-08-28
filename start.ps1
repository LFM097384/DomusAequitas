Write-Host "正在启动房间房租分配系统..." -ForegroundColor Green
Write-Host ""
Write-Host "请确保已经安装了Node.js和npm" -ForegroundColor Yellow
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 检查npm是否安装
try {
    $npmVersion = npm --version
    Write-Host "npm版本: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "错误: 未找到npm，请检查Node.js安装" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "正在安装依赖..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "依赖安装完成，正在启动应用..." -ForegroundColor Green
    npm start
} else {
    Write-Host "依赖安装失败，请检查网络连接或重试" -ForegroundColor Red
    Read-Host "按任意键退出"
}
