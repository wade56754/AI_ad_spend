# 本地测试脚本
Write-Host "=== 广告投手消耗上报系统 - 本地测试 ===" -ForegroundColor Cyan
Write-Host ""

# 检查后端环境
Write-Host "1. 检查后端配置..." -ForegroundColor Yellow
$backendEnv = "E:\AI\ad-spend-system\backend\.env"
if (Test-Path $backendEnv) {
    Write-Host "   ✓ .env 文件存在" -ForegroundColor Green
} else {
    Write-Host "   ✗ .env 文件不存在" -ForegroundColor Red
    Write-Host "   请创建 backend/.env 文件，参考 ENV_SETUP.txt" -ForegroundColor Yellow
}

# 检查前端环境
Write-Host "2. 检查前端配置..." -ForegroundColor Yellow
$frontendEnv = "E:\AI\ad-spend-system\with-supabase-app\.env.local"
if (Test-Path $frontendEnv) {
    Write-Host "   ✓ .env.local 文件存在" -ForegroundColor Green
} else {
    Write-Host "   ✗ .env.local 文件不存在" -ForegroundColor Red
    Write-Host "   请创建 with-supabase-app/.env.local 文件" -ForegroundColor Yellow
}

# 检查 Python
Write-Host "3. 检查 Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Python 未安装" -ForegroundColor Red
}

# 检查 Node.js
Write-Host "4. 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "   ✓ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js 未安装" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 启动指南 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "终端 1 - 启动后端:" -ForegroundColor Yellow
Write-Host "  cd E:\AI\ad-spend-system\backend" -ForegroundColor White
Write-Host "  uvicorn app.main:app --reload --port 8000" -ForegroundColor White
Write-Host ""
Write-Host "终端 2 - 启动前端:" -ForegroundColor Yellow
Write-Host "  cd E:\AI\ad-spend-system\with-supabase-app" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  后端 API 文档: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  前端应用: http://localhost:3000" -ForegroundColor Green
Write-Host ""
