@echo off
setlocal

cd /d "%~dp0"

echo =================================
echo        IPFS Initialization
echo =================================

:: 1. 如果 .env 不存在，则从 .env.example 复制
if not exist ".env" (
    copy "env.example" ".env" >nul
    echo .env created from env.example
) else (
    echo .env already exists, skipping copy
)

:: 2. 读取 .env 配置
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if "%%a"=="PORT" set "PORT=%%b"
    if "%%a"=="HOST" set "HOST=%%b"
)

if not defined PORT (
    echo ERROR: PORT is not configured in .env
    exit /b 1
)

:: 3. 初始化 IPFS
if not exist "%USERPROFILE%\.ipfs\config" (
    ipfs init
    if errorlevel 1 exit /b 1
) else (
    echo IPFS already initialized, skipping init
)

:: 4. 启用 IPFS Pubsub
ipfs config --json Pubsub.Enabled true
if errorlevel 1 exit /b 1

:: 5. 配置 IPFS API CORS
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://localhost:%PORT%\",\"http://127.0.0.1:%PORT%\"]"
if errorlevel 1 exit /b 1

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"GET\",\"POST\",\"PUT\",\"DELETE\",\"OPTIONS\"]"
if errorlevel 1 exit /b 1

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers "[\"Content-Type\",\"Authorization\"]"
if errorlevel 1 exit /b 1

echo.
echo =================================
echo     IPFS configuration completed
echo =================================
echo PORT: %PORT%
echo HOST: %HOST%

endlocal