# gitpush.ps1 - 简化版GitHub仓库操作脚本
# 确保脚本在出错时停止执行
# 设置脚本使用UTF-8编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
$ErrorActionPreference = "Stop"

Write-Host "Git 推送助手" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

# 获取脚本所在目录和当前执行目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$currentDir = Get-Location

Write-Host "脚本所在目录: $scriptDir" -ForegroundColor Cyan
Write-Host "当前执行目录: $currentDir" -ForegroundColor Cyan

# 重要: 确保工作目录是脚本所在目录
Set-Location $scriptDir
Write-Host "已切换到脚本所在目录: $scriptDir" -ForegroundColor Green

# 检查当前目录是否是Git仓库
function Test-GitRepo {
    try {
        $null = git rev-parse --is-inside-work-tree 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# 初始化Git仓库
function Initialize-GitRepo {
    try {
        # 检查是否已存在.git目录
        if (Test-Path ".git") {
            Write-Host "检测到旧的.git目录，为确保干净的初始化，将移除该目录" -ForegroundColor Yellow
            Remove-Item -Recurse -Force ".git"
            Write-Host "已移除旧的.git目录" -ForegroundColor Green
        }
        
        # 初始化新的Git仓库
        git init
        Write-Host "Git仓库初始化完成" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Git仓库初始化失败: $_" -ForegroundColor Red
        return $false
    }
}

function Add-FilesToGit {
    Write-Host "`n步骤1: 添加所有文件到Git..." -ForegroundColor Yellow
    
    # 将当前目录下的所有文件添加到Git
    Write-Host "当前目录: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "正在添加当前目录下的所有文件..." -ForegroundColor Yellow
    
    # 直接添加当前目录下的所有文件
    git add .
    
    # 检查是否有文件被添加
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "已添加以下文件到暂存区:" -ForegroundColor Green
        $gitStatus | ForEach-Object {
            $status = $_.Substring(0, 2).Trim()
            $file = $_.Substring(2).Trim()
            Write-Host "$status $file" -ForegroundColor Green
        }
        return $true
    } else {
        Write-Host "没有检测到需要提交的更改" -ForegroundColor Yellow
        return $false
    }
}

function Commit-Changes {
    Write-Host "`n步骤2: 提交更改..." -ForegroundColor Yellow
    $COMMIT_MSG = Read-Host "请输入提交信息 (直接回车使用默认信息 'Update project files')"
    
    if ([string]::IsNullOrWhiteSpace($COMMIT_MSG)) {
        $COMMIT_MSG = "Update project files"
        Write-Host "使用默认提交信息: $COMMIT_MSG" -ForegroundColor Yellow
    }
    
    try {
        git commit -m $COMMIT_MSG
        Write-Host "更改已提交" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "提交更改失败！请检查错误信息: $_" -ForegroundColor Red
        return $false
    }
}

function Push-ToRemote {
    Write-Host "`n步骤3: 推送到远程仓库..." -ForegroundColor Yellow
    
    # 检查是否已配置远程仓库
    $hasRemote = $false
    $remoteUrl = ""
    try {
        $remoteUrl = git remote get-url origin 2>&1
        if ($LASTEXITCODE -eq 0) {
            $hasRemote = $true
            Write-Host "检测到已配置的远程仓库: $remoteUrl" -ForegroundColor Green
        }
    } catch {
        # 远程仓库未配置，继续询问
    }
    
    # 如果没有远程仓库，询问用户
    if (-not $hasRemote) {
        $REPO_URL = Read-Host "请输入远程仓库URL (例如: https://github.com/username/repo.git)"
        
        if ([string]::IsNullOrWhiteSpace($REPO_URL)) {
            Write-Host "未提供远程仓库URL，将退出" -ForegroundColor Red
            return $false
        }
        
        # 设置远程仓库
        git remote add origin $REPO_URL
        Write-Host "已添加远程仓库: $REPO_URL" -ForegroundColor Green
        $remoteUrl = $REPO_URL
    }
    
    # 获取当前分支作为默认值
    $defaultBranch = ""
    try {
        $defaultBranch = git rev-parse --abbrev-ref HEAD
        # 如果HEAD不指向任何分支（例如新初始化的仓库），则使用main作为默认值
        if ($defaultBranch -eq "HEAD") {
            $defaultBranch = "main"
        }
    } catch {
        # 如果获取当前分支失败，则使用main作为默认值
        $defaultBranch = "main"
    }
    
    $BRANCH = Read-Host "请输入分支名称 (直接回车使用默认分支 '$defaultBranch')"
    
    if ([string]::IsNullOrWhiteSpace($BRANCH)) {
        $BRANCH = $defaultBranch
        Write-Host "使用默认分支: $BRANCH" -ForegroundColor Yellow
    }
    
    # 检查分支是否存在，如果不存在则创建
    $branchExists = $false
    try {
        $branchList = git branch --list
        $branchExists = $branchList -match "\b$BRANCH\b"
    } catch {
        # 如果检查失败，假设分支不存在
        $branchExists = $false
    }
    
    if (-not $branchExists) {
        Write-Host "分支 '$BRANCH' 不存在，创建并切换到该分支..." -ForegroundColor Yellow
        try {
            git checkout -b $BRANCH
            Write-Host "已创建并切换到分支: $BRANCH" -ForegroundColor Green
        } catch {
            Write-Host "创建分支失败: $_" -ForegroundColor Red
            return $false
        }
    } else {
        # 确保我们在正确的分支上
        git checkout $BRANCH
        Write-Host "已切换到分支: $BRANCH" -ForegroundColor Green
    }
    
    $FORCE_PUSH = Read-Host "是否强制推送？(y/n, 直接回车默认为n)"
    
    if ([string]::IsNullOrWhiteSpace($FORCE_PUSH)) {
        $FORCE_PUSH = "n"
        Write-Host "使用默认选项: 不强制推送" -ForegroundColor Yellow
    }
    
    $pushSuccess = $false
    try {
        if ($FORCE_PUSH -eq "y") {
            Write-Host "正在强制推送到 $remoteUrl 的 $BRANCH 分支..." -ForegroundColor Yellow
            git push -f origin $BRANCH 2>&1 | Out-String | Write-Host
        } else {
            Write-Host "正在推送到 $remoteUrl 的 $BRANCH 分支..." -ForegroundColor Yellow
            git push origin $BRANCH 2>&1 | Out-String | Write-Host
        }
        
        # 明确检查上一个命令的返回状态
        if ($LASTEXITCODE -eq 0) {
            $pushSuccess = $true
            Write-Host "推送成功完成！" -ForegroundColor Green
        } else {
            $pushSuccess = $false
            Write-Host "推送失败！请检查错误信息" -ForegroundColor Red
        }
    } catch {
        $pushSuccess = $false
        Write-Host "推送过程中出现异常: $_" -ForegroundColor Red
    }
    
    return $pushSuccess
}

# 主流程
try {
    # 检查当前目录是否是Git仓库
    if (-not (Test-GitRepo)) {
        $initResult = Initialize-GitRepo
        if (-not $initResult) {
            Write-Host "无法初始化Git仓库，退出脚本" -ForegroundColor Red
            # 恢复原始目录
            Set-Location $currentDir
            exit 1
        }
    } else {
        # 如果是Git仓库，检查是否是在脚本目录中的Git仓库
        $gitRoot = git rev-parse --show-toplevel
        if ($gitRoot -ne $scriptDir) {
            Write-Host "警告: 检测到的Git仓库($gitRoot)不是在脚本目录($scriptDir)中" -ForegroundColor Yellow
            $reinitialize = Read-Host "是否要重新初始化Git仓库以确保只包含当前项目? (y/n, 默认y)"
            
            if ([string]::IsNullOrWhiteSpace($reinitialize) -or $reinitialize.ToLower() -eq "y") {
                $initResult = Initialize-GitRepo
                if (-not $initResult) {
                    Write-Host "无法初始化Git仓库，退出脚本" -ForegroundColor Red
                    # 恢复原始目录
                    Set-Location $currentDir
                    exit 1
                }
            }
        }
    }

    # 添加文件到Git
    $addResult = Add-FilesToGit
    if (-not $addResult) {
        $continue = Read-Host "没有检测到更改，是否继续？(y/n, 直接回车默认为n)"
        if ([string]::IsNullOrWhiteSpace($continue) -or $continue -ne "y") {
            Write-Host "操作已取消" -ForegroundColor Yellow
            # 恢复原始目录
            Set-Location $currentDir
            exit 0
        }
    }

    # 提交更改
    $commitResult = Commit-Changes
    if (-not $commitResult) {
        Write-Host "提交失败，退出脚本" -ForegroundColor Red
        # 恢复原始目录
        Set-Location $currentDir
        exit 1
    }

    # 推送到远程仓库
    $pushResult = Push-ToRemote
    if (-not $pushResult) {
        Write-Host "推送失败，请检查错误信息并重试" -ForegroundColor Red
        # 恢复原始目录
        Set-Location $currentDir
        exit 1
    }

    Write-Host "`n所有操作已完成！" -ForegroundColor Green
    
} catch {
    Write-Host "遇到错误: $_" -ForegroundColor Red
} finally {
    # 无论成功还是失败，最后都恢复到原始目录
    Set-Location $currentDir
    Write-Host "已恢复到原始目录: $currentDir" -ForegroundColor Cyan
}