import { pool } from '../db.js'
import { OTP_LIFETIME_MINUTES, MAX_OTP_ATTEMPTS } from '../config/constants.js'
import { createSession, generateOtp, hashValue, matchesHash } from '../auth.js'
import { createOtp, findLatestUnverifiedOtp, incrementOtpAttempts, markOtpVerified } from '../repositories/otpRepository.js'
import { createUser, findUserByEmail, findUserById } from '../repositories/userRepository.js'
import type { RegistrationInput, UserProfile } from '../types/api.js'

function toProfile(user: { email: string; first_name: string; last_name: string; phone: string }): UserProfile {
  return { email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone }
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
    const user = await createUser({ ...input, email }, client)
    const expiresAt = new Date(Date.now() + OTP_LIFETIME_MINUTES * 60 * 1000)
    await createOtp(user.id, hashValue(otp), expiresAt, client)
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
  const record = await findLatestUnverifiedOtp(email)
  if (!record || record.expires_at <= new Date() || record.attempts >= MAX_OTP_ATTEMPTS) throw new Error('Invalid or expired OTP')
  if (!matchesHash(otp, record.otp_hash)) {
    await incrementOtpAttempts(record.id)
    throw new Error('Invalid or expired OTP')
  }
  await markOtpVerified(record.id)
  const user = await findUserById(record.user_id)
  if (!user) throw new Error('Authentication required')
  await createSession(record.user_id, response)
  return toProfile(user)
}
