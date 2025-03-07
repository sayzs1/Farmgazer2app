#!/bin/bash

# 这是一个简化版的部署脚本，专注于解决当前的部署问题
# 使用方法: ./fix-deploy.sh

echo "开始修复部署问题..."

# 1. 创建必要的配置文件
echo "创建配置文件..."

# 创建.deployment文件
echo '[config]' > .deployment
echo 'command = bash deploy.sh' >> .deployment

# 创建deploy.sh文件
cat > deploy.sh << 'EOL'
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
export NODE_OPTIONS="--max-old-space-size=4096"

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
EOL

chmod +x deploy.sh

# 创建web.config文件
cat > web.config << 'EOL'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <iisnode 
      nodeProcessCommandLine="node.exe --max-old-space-size=4096"
      watchedFiles="*.js;node_modules\*;routes\*.js;views\*.jade"
      loggingEnabled="true"
      logDirectory="iisnode"
      maxLogFileSizeInKB="1024"
      maxTotalLogFileSizeInKB="20480"
      maxLogFiles="20"
    />
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin" />
        </hiddenSegments>
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
EOL

# 2. 创建一个简单的server.js备份
echo "创建server.js备份..."
cp server.js server.js.bak

# 3. 创建一个简化版的server.js
cat > server.js << 'EOL'
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .listen(port, () => {
    console.log(`> Ready on port ${port}`)
  })
})
EOL

echo "修复脚本创建完成!"
echo "请在GitHub Actions中重新运行部署工作流"
echo "或者在Azure门户中手动部署这些文件" 