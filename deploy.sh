#!/bin/bash

# ----------------------
# 自定义部署脚本
# ----------------------

# 1. 设置基本变量
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARTIFACTS=$SCRIPT_DIR/../artifacts
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}

# 2. 设置Node环境
NODE_EXE="$PROGRAMFILES/nodejs/node.exe"
NPM_CMD="$PROGRAMFILES/nodejs/npm.cmd"
NODE_MODULES_DIR="$SCRIPT_DIR/node_modules"

# 3. 设置部署源和目标
DEPLOYMENT_SOURCE="${DEPLOYMENT_SOURCE:-$SCRIPT_DIR}"
DEPLOYMENT_TARGET="${DEPLOYMENT_TARGET:-$SCRIPT_DIR}"

# 4. 设置Kudu同步参数
NEXT_MANIFEST_PATH="${NEXT_MANIFEST_PATH:-$ARTIFACTS/manifest}"
PREVIOUS_MANIFEST_PATH="${PREVIOUS_MANIFEST_PATH:-$ARTIFACTS/manifest}"

# 5. 优化内存使用
export NODE_OPTIONS="--max-old-space-size=2048"

# 6. 安装依赖
echo "安装生产依赖..."
cd "$DEPLOYMENT_SOURCE"
npm ci --only=production --no-optional

# 7. 构建应用
echo "构建应用..."
npm run build

# 8. 清理不必要的文件以减少部署大小
echo "清理不必要的文件..."
rm -rf node_modules/.cache
rm -rf .git
find . -name "*.map" -type f -delete

# 9. 同步文件到部署目标
echo "同步文件到部署目标..."
"$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_SOURCE" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh"

# 10. 设置启动命令
echo "设置启动命令..."
cd "$DEPLOYMENT_TARGET"
echo "node server.js" > startup.txt

echo "部署完成!"
exit 0 