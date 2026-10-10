import { text } from './text.js'
import type { CheckoutInput, RegistrationInput } from '../types/api.js'

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const phonePattern = /^[+()\d\s-]{10,20}$/
export const otpPattern = /^\d{6}$/

export function isValidRegistration(body: unknown): body is RegistrationInput {
  if (!body || typeof body !== 'object') return false
  const candidate = body as Record<string, unknown>
  return emailPattern.test(text(candidate.email))
    && text(candidate.firstName).length >= 1
    && text(candidate.firstName).length <= 80
    && text(candidate.lastName).length >= 1
    && text(candidate.lastName).length <= 80
    && phonePattern.test(text(candidate.phone))
}

export function isValidCheckout(body: unknown): body is CheckoutInput {
  if (!body || typeof body !== 'object') return false
  const candidate = body as Record<string, unknown>
  return emailPattern.test(text(candidate.email))
    && phonePattern.test(text(candidate.phone))
    && text(candidate.shippingAddress).length >= 5
    && text(candidate.shippingAddress).length <= 300
}
