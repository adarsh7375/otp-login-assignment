import type { NextFunction, Request, Response } from 'express'
import { findUserByEmail, isRegisteredEmail } from '../repositories/userRepository.js'
import { emailPattern } from '../utils/validation.js'
import { text } from '../utils/text.js'

export async function checkRegisteredEmailController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const email = text(request.query.email).toLowerCase()
  if (!emailPattern.test(email)) {
    response.status(400).json({ error: 'A valid email is required' })
    return
  }
  try {
    response.json({ registered: await isRegisteredEmail(email) })
  } catch (error) {
    next(error)
  }
}
