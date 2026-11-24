#!/usr/bin/env bash

set -e

# 1. 如果 .env 不存在，则从 .env.example 复制
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env created from env.example"
else
    echo ".env already exists, skipping copy"
fi

# 2. 加载环境变量
set -a
source .env
set +a

# 3. 初始化 IPFS（仅在尚未初始化时执行）
if [ ! -f "$HOME/.ipfs/config" ]; then
    ipfs init
else
    echo "IPFS already initialized, skipping init"
fi

# 4. 启用 IPFS Pubsub
ipfs config --json Pubsub.Enabled true

# 5. 配置 IPFS API CORS
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin \
    "[\"http://localhost:${PORT}\",\"http://127.0.0.1:${PORT}\"]"

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods \
    '["GET","POST","PUT","DELETE","OPTIONS"]'

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers \
    '["Content-Type","Authorization"]'

echo ""
echo "================================"
echo "IPFS initialization completed!"
echo "Port: ${PORT}"
echo "Host: ${HOST}"
echo "================================"