import type { PoolClient } from 'pg'
import { pool } from '../db.js'
import type { UserProfile } from '../types/api.js'

type UserRow = { id: number; email: string; first_name: string; last_name: string; phone: string }

export async function findUserByEmail(email: string, client: PoolClient | typeof pool = pool): Promise<UserRow | undefined> {
  const result = await client.query<UserRow>(
    'SELECT id, email, first_name, last_name, phone FROM users WHERE email = $1',
    [email],
  )
  return result.rows[0]
}

export async function createUser(input: UserProfile, client: PoolClient): Promise<{ id: number }> {
  const result = await client.query<{ id: number }>(
    'INSERT INTO users (email, first_name, last_name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
    [input.email, input.firstName, input.lastName, input.phone],
  )
  return result.rows[0]
}

export async function findUserById(id: number): Promise<UserRow | undefined> {
  const result = await pool.query<UserRow>(
    'SELECT id, email, first_name, last_name, phone FROM users WHERE id = $1',
    [id],
  )
  return result.rows[0]
}

export async function isRegisteredEmail(email: string): Promise<boolean> {
  return Boolean(await findUserByEmail(email))
}
