import { pool } from '../db.js'
import type { Pool, PoolClient } from 'pg'
import { OTP_LIFETIME_MINUTES, MAX_OTP_ATTEMPTS } from '../config/constants.js'
import { createSession, generateOtp, hashValue, matchesHash } from '../auth.js'
import type { RegistrationInput, UserProfile } from '../types/api.js'

type UserRow = { id: number; email: string; first_name: string; last_name: string; phone: string }
type OtpRow = { id: number; user_id: number; otp_hash: string; expires_at: Date; attempts: number }

function toProfile(user: { email: string; first_name: string; last_name: string; phone: string }): UserProfile {
  return { email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone }
}

async function findUserByEmail(email: string, client: Pool | PoolClient = pool): Promise<UserRow | undefined> {
  const result = await client.query<UserRow>(
    'SELECT id, email, first_name, last_name, phone FROM users WHERE email = $1',
    [email],
  )
  return result.rows[0]
}

export async function findUserById(id: number): Promise<UserRow | undefined> {
  const result = await pool.query<UserRow>(
    'SELECT id, email, first_name, last_name, phone FROM users WHERE id = $1',
    [id],
  )
  return result.rows[0]
}

export async function isRegisteredEmail(email: string): Promise<boolean> {
  return Boolean(await findUserByEmail(email))
}

export async function register(input: RegistrationInput): Promise<{ user: UserProfile; otp: string; otpExpiresAt: string }> {
  const email = input.email.toLowerCase()
  const otp = generateOtp()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (await findUserByEmail(email, client)) {
      await client.query('ROLLBACK')
      throw new Error('Email is already registered')
    }
    const userResult = await client.query<{ id: number }>(
      'INSERT INTO users (email, first_name, last_name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, input.firstName, input.lastName, input.phone],
    )
    const expiresAt = new Date(Date.now() + OTP_LIFETIME_MINUTES * 60 * 1000)
    await client.query(
      'INSERT INTO otp_verifications (user_id, otp_hash, expires_at) VALUES ($1, $2, $3)',
      [userResult.rows[0].id, hashValue(otp), expiresAt],
    )
    await client.query('COMMIT')
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_OTP_OUTPUT === 'true') console.info(`[DEV ONLY] OTP for ${email}: ${otp}`)
    return { user: { ...input, email }, otp, otpExpiresAt: expiresAt.toISOString() }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function verifyOtp(email: string, otp: string, response: import('express').Response): Promise<UserProfile> {
  const result = await pool.query<OtpRow>(
    `SELECT otp.id, otp.user_id, otp.otp_hash, otp.expires_at, otp.attempts
     FROM otp_verifications otp JOIN users u ON u.id = otp.user_id
     WHERE u.email = $1 AND otp.verified_at IS NULL
     ORDER BY otp.created_at DESC LIMIT 1`,
    [email],
  )
  const record = result.rows[0]
  if (!record || record.expires_at <= new Date() || record.attempts >= MAX_OTP_ATTEMPTS) throw new Error('Invalid or expired OTP')
  if (!matchesHash(otp, record.otp_hash)) {
    await pool.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [record.id])
    throw new Error('Invalid or expired OTP')
  }
  await pool.query('UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1', [record.id])
  const user = await findUserById(record.user_id)
  if (!user) throw new Error('Authentication required')
  await createSession(record.user_id, response)
  return toProfile(user)
}
