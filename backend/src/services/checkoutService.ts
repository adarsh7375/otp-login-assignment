import { pool } from '../db.js'
import type { CheckoutInput } from '../types/api.js'

export async function submitCheckout(userId: number, input: CheckoutInput): Promise<{ submissionId: number; createdAt: Date }> {
  const userResult = await pool.query<{ email: string }>('SELECT email FROM users WHERE id = $1', [userId])
  const user = userResult.rows[0]
  if (!user || user.email !== input.email.toLowerCase()) throw new Error('Checkout email does not match the authenticated user')
  const result = await pool.query<{ id: number; created_at: Date }>(
    `INSERT INTO checkout_submissions (user_id, email, phone, shipping_address)
     VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
    [userId, user.email, input.phone, input.shippingAddress],
  )
  return { submissionId: result.rows[0].id, createdAt: result.rows[0].created_at }
}
