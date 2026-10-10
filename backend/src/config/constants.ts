export const PORT = Number(process.env.PORT ?? 4000)
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
export const OTP_LIFETIME_MINUTES = 10
export const MAX_OTP_ATTEMPTS = 5
export const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 24)
export const SESSION_COOKIE_NAME = 'otp_session'
export const JSON_BODY_LIMIT = '32kb'
