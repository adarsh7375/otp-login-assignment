import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import 'dotenv/config'
import { FRONTEND_ORIGIN, JSON_BODY_LIMIT, PORT } from './config/constants.js'
import { router } from './routes.js'
import { pool } from './db.js'

const app = express()

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true
  const allowedOrigins = [FRONTEND_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173']
  if (allowedOrigins.includes(origin)) return true
  const hostname = new URL(origin).hostname
  return hostname === 'localhost' || hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com')
}

app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
}))
app.use(express.json({ limit: JSON_BODY_LIMIT }))
app.use('/api', router)

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' })
})

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})

async function start(): Promise<void> {
  await pool.query('SELECT 1')
  app.listen(PORT, () => console.info(`API listening on http://localhost:${PORT}`))
}

start().catch((error: unknown) => {
  console.error('Unable to start API. Check DATABASE_URL and PostgreSQL availability.')
  console.error(error)
  process.exitCode = 1
})
