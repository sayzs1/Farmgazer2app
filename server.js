require('dotenv').config()

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// 输出环境变量以验证
console.log('当前环境:', process.env.NODE_ENV)
console.log('端口:', process.env.PORT)
console.log('WEBSITES_PORT:', process.env.WEBSITES_PORT)

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

console.log('使用端口:', port)
console.log('开发模式:', dev)

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    console.log('Next.js 应用准备就绪')
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('处理请求时发生错误:', err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('准备过程发生错误:', err)
    process.exit(1)
  }) 