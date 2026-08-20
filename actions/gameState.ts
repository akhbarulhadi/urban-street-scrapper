'use server'

import { SignJWT, jwtVerify } from 'jose'
import { GameState } from '@/types/game'

// Validasi secret key di environment
const secretKey = process.env.JWT_SECRET_KEY
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not defined in environment variables')
}

// Encode secret key untuk jose
const key = new TextEncoder().encode(secretKey)

/**
 * Menerima state JSON dari client, sign menggunakan JWT,
 * dan mengembalikan JWT token.
 */
export async function saveGame(gameState: GameState): Promise<{ success: boolean, token?: string, error?: string }> {
  try {
    const token = await new SignJWT({ state: gameState })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      // Token tidak akan kadaluarsa atau bisa diset exp (misal: .setExpirationTime('30d'))
      .sign(key)
    
    return { success: true, token }
  } catch (error) {
    console.error('Failed to sign game state:', error)
    return { success: false, error: 'Failed to save game' }
  }
}

/**
 * Menerima JWT token dari client, verify signature,
 * dan mengembalikan state JSON aslinya.
 */
export async function loadGame(token: string): Promise<{ success: boolean, gameState?: GameState, error?: string }> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    
    if (payload && payload.state) {
      return { success: true, gameState: payload.state as GameState }
    } else {
      return { success: false, error: 'Invalid token payload format' }
    }
  } catch (error) {
    // Error biasanya karena token tampered / rusak / kadaluarsa
    console.error('Failed to verify game state:', error)
    return { success: false, error: 'Invalid or tampered game data' }
  }
}
