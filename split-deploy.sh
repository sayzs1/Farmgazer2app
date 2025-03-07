#!/bin/bash

# 这是一个分离部署脚本，将应用分成多个小包进行部署
# 使用方法: ./split-deploy.sh <资源组名称>

if [ -z "$1" ]; then
  echo "请提供资源组名称"
  echo "使用方法: ./split-deploy.sh <资源组名称>"
  exit 1
fi

RESOURCE_GROUP=$1
APP_NAME="farmgazer2app"
TEMP_DIR="deploy-temp"

echo "开始分离部署到Azure..."

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

# 4. 创建临时目录
echo "创建临时目录..."
mkdir -p $TEMP_DIR

# 5. 分离部署
echo "分离部署..."

# 5.1 部署基础文件
echo "部署基础文件..."
mkdir -p $TEMP_DIR/base
cp -r server.js package.json package-lock.json .deployment deploy.sh web.config $TEMP_DIR/base/
cd $TEMP_DIR/base
zip -r ../base.zip .
cd ../..
echo "正在部署基础文件..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src $TEMP_DIR/base.zip

# 5.2 部署.next目录
echo "部署.next目录..."
mkdir -p $TEMP_DIR/next
cp -r .next $TEMP_DIR/next/
cd $TEMP_DIR/next
zip -r ../next.zip .
cd ../..
echo "正在部署.next目录..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src $TEMP_DIR/next.zip

# 5.3 部署node_modules目录
echo "部署node_modules目录..."
mkdir -p $TEMP_DIR/modules
cp -r node_modules $TEMP_DIR/modules/
cd $TEMP_DIR/modules
zip -r ../modules.zip .
cd ../..
echo "正在部署node_modules目录..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src $TEMP_DIR/modules.zip

# 6. 清理临时目录
echo "清理临时目录..."
rm -rf $TEMP_DIR

echo "分离部署完成!"
echo "请检查Azure门户中的应用状态" 