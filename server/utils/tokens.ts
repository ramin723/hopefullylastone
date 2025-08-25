import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { createRequestLogger } from './logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY_DAYS = 30

export interface TokenPayload {
  userId: number
  role: string
  phone: string
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

export const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)
  return expiry
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}
