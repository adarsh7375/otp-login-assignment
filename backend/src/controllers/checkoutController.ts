import type { NextFunction, Response } from 'express'
import { isValidCheckout } from '../utils/validation.js'
import { submitCheckout } from '../services/checkoutService.js'
import type { AuthenticatedRequest } from '../types/api.js'

export async function checkoutController(request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> {
  if (!isValidCheckout(request.body)) {
    response.status(400).json({ error: 'Valid email, phone, and shipping address are required' })
    return
  }
  try {
    response.status(201).json(await submitCheckout(request.userId!, {
      ...request.body,
      email: request.body.email.trim().toLowerCase(),
    }))
  } catch (error) {
    if (error instanceof Error && error.message === 'Checkout email does not match the authenticated user') {
      response.status(403).json({ error: error.message })
      return
    }
    next(error)
  }
}
