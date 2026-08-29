'use server'

import { SignJWT, jwtVerify } from 'jose'
import { GameState } from '@/types/game'

const secretKey = process.env.JWT_SECRET_KEY
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not defined in environment variables')
}

const key = new TextEncoder().encode(secretKey)

// Signs game state as a JWT — no expiry so saves persist indefinitely.
export async function saveGame(gameState: GameState): Promise<{ success: boolean, token?: string, error?: string }> {
  try {
    const token = await new SignJWT({ state: gameState })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(key)
    
    return { success: true, token }
  } catch (error) {
    console.error('Failed to sign game state:', error)
    return { success: false, error: 'Failed to save game' }
  }
}

// Verifies the JWT signature — rejects tampered or malformed saves.
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
    console.error('Failed to verify game state:', error)
    return { success: false, error: 'Invalid or tampered game data' }
  }
}
