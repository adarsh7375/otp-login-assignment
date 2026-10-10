import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { pool } from './db.js'
import { SESSION_COOKIE_NAME, SESSION_TTL_HOURS } from './config/constants.js'
import type { AuthenticatedRequest } from './types/api.js'

export function generateOtp(): string {
  return String(randomInt(100000, 1000000))
}

export function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function matchesHash(value: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashValue(value), 'hex')
  const expected = Buffer.from(expectedHash, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function readCookie(request: Request, name: string): string | null {
  const cookies = request.headers.cookie?.split(';') ?? []
  const cookie = cookies.find((part) => part.trim().startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null
}

function cookiePolicy(): string {
  return process.env.NODE_ENV === 'production' ? '; Secure; SameSite=None' : '; SameSite=Lax'
}

export async function createSession(userId: number, response: Response): Promise<void> {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashValue(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)

  await pool.query(
    'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [tokenHash, userId, expiresAt],
  )

  response.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly${cookiePolicy()}; Path=/; Max-Age=${Math.floor(SESSION_TTL_HOURS * 60 * 60)}`)
}

export async function clearSession(request: Request, response: Response): Promise<void> {
  const token = readCookie(request, SESSION_COOKIE_NAME)
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashValue(token)])
  response.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; HttpOnly${cookiePolicy()}; Path=/; Max-Age=0`)
}

export async function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> {
  try {
    const token = readCookie(request, SESSION_COOKIE_NAME)
    if (!token) {
      response.status(401).json({ error: 'Authentication required' })
      return
    }

    const result = await pool.query<{ user_id: number }>(
      'SELECT user_id FROM sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [hashValue(token)],
    )
    if (!result.rows[0]) {
      response.status(401).json({ error: 'Authentication required' })
      return
    }

    request.userId = result.rows[0].user_id
    next()
  } catch (error) {
    next(error)
  }
}
