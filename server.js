import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const projectDirectory = dirname(fileURLToPath(import.meta.url))
const distDirectory = resolve(projectDirectory, 'dist')
const indexFile = resolve(distDirectory, 'index.html')

if (!existsSync(indexFile)) {
  throw new Error('Build output not found. Run "npm run build" before starting the server.')
}

app.disable('x-powered-by')
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

app.get('/health', (_request, response) => {
  response.type('text/plain').send('ok')
})

app.use(express.static(distDirectory, { index: false }))

app.get('/{*path}', (_request, response, next) => {
  response.sendFile(indexFile, (error) => {
    if (error) {
      next(error)
    }
  })
})

app.use((error, _request, response, next) => {
  console.error('Unable to serve request:', error)
  if (response.headersSent) {
    next(error)
    return
  }
  response.status(500).send('Internal server error')
})

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Rooisht Express server listening on port ${port}`)
})
