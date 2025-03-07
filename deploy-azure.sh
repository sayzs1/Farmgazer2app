#!/bin/bash

# 这是一个用于手动部署到Azure的脚本
# 使用方法: ./deploy-azure.sh

echo "开始部署到Azure..."

# 1. 清理和构建
echo "清理和构建项目..."
rm -rf node_modules
rm -rf .next
npm ci
NODE_ENV=production npm run build

# 2. 优化部署包大小
echo "优化部署包大小..."
rm -rf node_modules/.cache
find . -name "*.map" -type f -delete
npm prune --production

# 3. 创建必要的配置文件
echo "创建配置文件..."

# 创建.deployment文件
echo '[config]' > .deployment
echo 'command = bash deploy.sh' >> .deployment

# 创建deploy.sh文件
cat > deploy.sh << 'EOL'
#!/bin/bash

# 优化内存使用
export NODE_OPTIONS="--max-old-space-size=4096"

# 设置启动命令
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

# 4. 创建部署包
echo "创建部署包..."
zip -r deploy.zip . -x "*.git*" "*.github*" "node_modules/.cache/*" "*.map" "*.log"

echo "部署包已创建: deploy.zip"
echo "请使用Azure CLI或Azure门户手动上传此部署包"
echo "或者使用以下命令部署:"
echo "az webapp deployment source config-zip --resource-group <资源组名称> --name farmgazer2app --src deploy.zip" 