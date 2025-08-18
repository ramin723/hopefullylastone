// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

export function sign(payload: object, expSeconds = 60 * 60 * 24) {
  return jwt.sign(payload, SECRET, { expiresIn: expSeconds })
}

export function verify<T = any>(token: string): T {
  return jwt.verify(token, SECRET) as T
}
