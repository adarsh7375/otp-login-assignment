import { pool } from '../db.js'

export async function createCheckout(userId: number, email: string, phone: string, shippingAddress: string): Promise<{ id: number; created_at: Date }> {
  const result = await pool.query<{ id: number; created_at: Date }>(
    `INSERT INTO checkout_submissions (user_id, email, phone, shipping_address)
     VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
    [userId, email, phone, shippingAddress],
  )
  return result.rows[0]
}
