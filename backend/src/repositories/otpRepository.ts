import type { PoolClient } from 'pg'
import { pool } from '../db.js'

type OtpRow = { id: number; user_id: number; otp_hash: string; expires_at: Date; attempts: number }

export async function createOtp(userId: number, otpHash: string, expiresAt: Date, client: PoolClient): Promise<void> {
  await client.query(
    'INSERT INTO otp_verifications (user_id, otp_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, otpHash, expiresAt],
  )
}

export async function findLatestUnverifiedOtp(email: string): Promise<OtpRow | undefined> {
  const result = await pool.query<OtpRow>(
    `SELECT otp.id, otp.user_id, otp.otp_hash, otp.expires_at, otp.attempts
     FROM otp_verifications otp JOIN users u ON u.id = otp.user_id
     WHERE u.email = $1 AND otp.verified_at IS NULL
     ORDER BY otp.created_at DESC LIMIT 1`,
    [email],
  )
  return result.rows[0]
}

export async function incrementOtpAttempts(id: number): Promise<void> {
  await pool.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [id])
}

export async function markOtpVerified(id: number): Promise<void> {
  await pool.query('UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1', [id])
}
