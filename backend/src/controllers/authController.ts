import type { NextFunction, Request, Response } from 'express'
import { emailPattern, isValidRegistration, otpPattern } from '../utils/validation.js'
import { text } from '../utils/text.js'
import { clearSession } from '../auth.js'
import { findUserById, register, verifyOtp } from '../services/authService.js'
import type { AuthenticatedRequest } from '../types/api.js'

export async function registerController(request: Request, response: Response, next: NextFunction): Promise<void> {
  if (!isValidRegistration(request.body)) {
    response.status(400).json({ error: 'Valid email, first name, last name, and phone are required' })
    return
  }
  try {
    response.status(201).json(await register(request.body))
  } catch (error) {
    if (error instanceof Error && error.message === 'Email is already registered') {
      response.status(409).json({ error: error.message })
      return
    }
    next(error)
  }
}

export async function verifyOtpController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const email = text(request.body?.email).toLowerCase()
  const otp = text(request.body?.otp)
  if (!emailPattern.test(email) || !otpPattern.test(otp)) {
    response.status(401).json({ error: 'Invalid or expired OTP' })
    return
  }
  try {
    response.json({ user: await verifyOtp(email, otp, response) })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid or expired OTP' || error.message === 'Authentication required')) {
      response.status(401).json({ error: error.message })
      return
    }
    next(error)
  }
}

export async function currentUserController(request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> {
  try {
    const user = await findUserById(request.userId!)
    if (!user) {
      response.status(401).json({ error: 'Authentication required' })
      return
    }
    response.json({ user: { email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone } })
  } catch (error) {
    next(error)
  }
}

export async function logoutController(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    await clearSession(request, response)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
