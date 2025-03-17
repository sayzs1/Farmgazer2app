require('dotenv').config()

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// 输出环境变量以验证
console.log('当前环境:', process.env.NODE_ENV)

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