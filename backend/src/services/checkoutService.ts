import { createCheckout } from '../repositories/checkoutRepository.js'
import { findUserById } from '../repositories/userRepository.js'
import type { CheckoutInput } from '../types/api.js'

export async function submitCheckout(userId: number, input: CheckoutInput): Promise<{ submissionId: number; createdAt: Date }> {
  const user = await findUserById(userId)
  if (!user || user.email !== input.email.toLowerCase()) throw new Error('Checkout email does not match the authenticated user')
  const result = await createCheckout(userId, user.email, input.phone, input.shippingAddress)
  return { submissionId: result.id, createdAt: result.created_at }
}
