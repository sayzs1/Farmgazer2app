require('dotenv').config()

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// 进程启动时间
const startTime = new Date().toISOString()

// 输出环境变量以验证
console.log('=== 服务器启动 ===')
console.log('启动时间:', startTime)
console.log('进程 ID:', process.pid)
console.log('环境变量:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  WEBSITES_PORT: process.env.WEBSITES_PORT,
  PWD: process.cwd(),
  PLATFORM: process.platform
})

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

console.log(`服务器配置: 开发模式=${dev}, 主机=${hostname}, 端口=${port}`)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
})

// 进程退出处理
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，准备关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，准备关闭服务器...')
  process.exit(0)
})

const startServer = async () => {
  try {
    console.log('正在准备 Next.js 应用...')
    await app.prepare()
    console.log('Next.js 应用准备就绪')

    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        
        // 添加健康检查端点
        if (parsedUrl.pathname === '/health') {
          const uptime = process.uptime()
          const memoryUsage = process.memoryUsage()
          
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            startTime,
            uptime,
            memoryUsage: {
              heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
              heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
              rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
            },
            pid: process.pid
          }))
          return
        }

        // 记录请求信息
        console.log(`收到请求: ${req.method} ${req.url}`)
        
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('处理请求时发生错误:', err)
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    })

    // 错误处理
    server.on('error', (err) => {
      console.error('服务器错误:', err)
    })

    server.listen(port, hostname, (err) => {
      if (err) {
        console.error('启动服务器失败:', err)
        throw err
      }
      console.log(`=== 服务器就绪 ===`)
      console.log(`> 监听地址: http://${hostname}:${port}`)
      console.log(`> 健康检查: http://${hostname}:${port}/health`)
    })
  } catch (err) {
    console.error('启动过程发生错误:', err)
    process.exit(1)
  }
}

startServer() 