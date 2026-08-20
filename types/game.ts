export interface PlayerStats {
  maxHealth: number;
  jumpBoost: boolean;
  graffitiAmmo: number;
  airDash: boolean;
}

export interface GameState {
  streetCred: number;
  inventory: string[];
  playerStats: PlayerStats;
  score: number;
  highScore: number;
}
