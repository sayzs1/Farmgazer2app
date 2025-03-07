#!/bin/bash

# 这是一个使用Azure CLI直接部署的脚本
# 使用方法: ./azure-cli-deploy.sh <资源组名称>

if [ -z "$1" ]; then
  echo "请提供资源组名称"
  echo "使用方法: ./azure-cli-deploy.sh <资源组名称>"
  exit 1
fi

RESOURCE_GROUP=$1
APP_NAME="farmgazer2app"

echo "开始使用Azure CLI部署到Azure..."

# 1. 登录Azure
echo "登录Azure..."
az login

# 2. 设置应用设置
echo "设置应用设置..."
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings \
  NODE_ENV=production \
  PORT=3000 \
  WEBSITES_PORT=3000 \
  NODE_OPTIONS="--max-old-space-size=4096" \
  WEBSITE_NODE_DEFAULT_VERSION="~18" \
  SCM_COMMAND_IDLE_TIMEOUT=1800

# 3. 停止Web应用
echo "停止Web应用..."
az webapp stop --resource-group $RESOURCE_GROUP --name $APP_NAME

# 4. 清理远程Web应用
echo "清理远程Web应用..."
az webapp deployment source delete --resource-group $RESOURCE_GROUP --name $APP_NAME

# 5. 清理和构建本地项目
echo "清理和构建本地项目..."
rm -rf node_modules
rm -rf .next
npm ci
NODE_ENV=production npm run build

# 6. 优化部署包大小
echo "优化部署包大小..."
rm -rf node_modules/.cache
find . -name "*.map" -type f -delete
npm prune --production

# 7. 创建必要的配置文件
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

# 8. 创建部署包
echo "创建部署包..."
zip -r deploy.zip . -x "*.git*" "*.github*" "node_modules/.cache/*" "*.map" "*.log"

# 9. 部署到Azure
echo "部署到Azure..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src deploy.zip --timeout 1800

# 10. 启动Web应用
echo "启动Web应用..."
az webapp start --resource-group $RESOURCE_GROUP --name $APP_NAME

echo "部署完成!"
echo "请检查Azure门户中的应用状态" 