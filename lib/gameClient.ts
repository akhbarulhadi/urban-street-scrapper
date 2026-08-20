import { saveGame, loadGame } from '@/actions/gameState'
import { GameState } from '@/types/game'

const LOCAL_STORAGE_KEY = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY

export const DEFAULT_GAME_STATE: GameState = {
  streetCred: 0,
  inventory: [],
  playerStats: {
    maxHealth: 3,
    jumpBoost: false,
    graffitiAmmo: 3,
    airDash: false
  },
  score: 0,
  highScore: 0
}

export async function saveGameStateToStorage(state: GameState): Promise<boolean> {
  try {
    const result = await saveGame(state)

    if (result.success && result.token) {
      localStorage.setItem(LOCAL_STORAGE_KEY, result.token)
      return true
    } else {
      console.error('Server failed to sign game state:', result.error)
      return false
    }
  } catch (error) {
    console.error('Error saving game state:', error)
    return false
  }
}

export async function loadGameStateFromStorage(): Promise<GameState> {
  try {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!token) {
      return DEFAULT_GAME_STATE
    }

    const result = await loadGame(token)

    if (result.success && result.gameState) {
      return result.gameState
    } else {
      console.warn('Game state invalid or tampered. Reverting to default.', result.error)

      return DEFAULT_GAME_STATE
    }
  } catch (error) {
    console.error('Error loading game state:', error)
    return DEFAULT_GAME_STATE
  }
}
