'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { loadGameStateFromStorage, saveGameStateToStorage } from '@/lib/gameClient';


export enum GAME_STATE {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export type StatType = 'jumpBoost' | 'maxHealth' | 'graffitiAmmo' | 'airDash';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  stat: StatType;
}

export interface PlayerStats {
  maxHealth: number;
  jumpBoost: boolean;
  graffitiAmmo: number;
  airDash: boolean;
}

export interface StoreState {
  _hydrated: boolean;
  gameState: GAME_STATE;
  streetCred: number;
  inventory: string[];
  playerStats: PlayerStats;
  currentHealth: number;
  score: number;
  highScore: number;
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<StoreState> }
  | { type: 'SET_GAME_STATE'; payload: GAME_STATE }
  | { type: 'ADD_STREET_CRED'; payload: number }
  | { type: 'SET_STREET_CRED'; payload: number }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'RESET_SCORE' }
  | { type: 'SET_HEALTH'; payload: number }
  | { type: 'PURCHASE_ITEM'; payload: string }
  | { type: 'RESET_RUN' }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' };

export interface StoreContextValue extends StoreState {
  setGameState: (s: GAME_STATE) => void;
  addStreetCred: (n: number) => void;
  setStreetCred: (n: number) => void;
  addScore: (n: number) => void;
  resetScore: () => void;
  setHealth: (n: number) => void;
  purchaseItem: (id: string) => void;
  resetRun: () => void;
  triggerGameOver: () => void;
  triggerVictory: () => void;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'sneakers',
    name: 'Air Grind Sneakers',
    description: '+30% jump velocity & double jump unlock',
    price: 50,
    icon: '👟',
    stat: 'jumpBoost',
  },
  {
    id: 'hoodie',
    name: 'Armored Hoodie',
    description: '+2 max health points',
    price: 75,
    icon: '🧥',
    stat: 'maxHealth',
  },
  {
    id: 'sprayCan',
    name: 'Mega Spray Can',
    description: '+2 graffiti ammo capacity',
    price: 40,
    icon: '🎨',
    stat: 'graffitiAmmo',
  },
  {
    id: 'dashBoots',
    name: 'Rocket Kicks',
    description: 'Unlock air dash ability',
    price: 100,
    icon: '🚀',
    stat: 'airDash',
  },
];

const getInitialState = (): StoreState => {
  return {
    _hydrated: false,
    gameState: GAME_STATE.MENU,
    streetCred: 0,
    inventory: [],
    playerStats: { maxHealth: 3, jumpBoost: false, graffitiAmmo: 3, airDash: false },
    currentHealth: 3,
    score: 0,
    highScore: 0,
  };
};

const storeReducer = (state: StoreState, action: Action): StoreState => {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, _hydrated: true };

    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };

    case 'ADD_STREET_CRED':
      return { ...state, streetCred: state.streetCred + action.payload };

    case 'SET_STREET_CRED':
      return { ...state, streetCred: action.payload };

    case 'ADD_SCORE':
      return {
        ...state,
        score: state.score + action.payload,
        highScore: Math.max(state.highScore, state.score + action.payload),
      };

    case 'RESET_SCORE':
      return { ...state, score: 0 };

    case 'SET_HEALTH':
      return { ...state, currentHealth: Math.max(0, action.payload) };

    case 'PURCHASE_ITEM': {
      const item = SHOP_ITEMS.find((i) => i.id === action.payload);
      if (!item || state.streetCred < item.price || state.inventory.includes(item.id)) {
        return state;
      }
      const newStats = applyItemStat(state.playerStats, item);
      return {
        ...state,
        streetCred: state.streetCred - item.price,
        inventory: [...state.inventory, item.id],
        playerStats: newStats,
        currentHealth: item.id === 'hoodie' ? newStats.maxHealth : state.currentHealth,
      };
    }

    case 'RESET_RUN':
      return {
        ...state,
        currentHealth: state.playerStats.maxHealth,
        score: 0,
        gameState: GAME_STATE.PLAYING,
      };

    case 'GAME_OVER':
      return {
        ...state,
        gameState: GAME_STATE.GAME_OVER,
        highScore: Math.max(state.highScore, state.score),
      };

    case 'VICTORY':
      return {
        ...state,
        gameState: GAME_STATE.VICTORY,
        highScore: Math.max(state.highScore, state.score),
      };

    default:
      return state;
  }
};

const applyItemStat = (stats: PlayerStats, item: ShopItem): PlayerStats => {
  switch (item.stat) {
    case 'jumpBoost': return { ...stats, jumpBoost: true };
    case 'maxHealth': return { ...stats, maxHealth: stats.maxHealth + 2 };
    case 'graffitiAmmo': return { ...stats, graffitiAmmo: stats.graffitiAmmo + 2 };
    case 'airDash': return { ...stats, airDash: true };
    default: return stats;
  }
};

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(storeReducer, undefined, getInitialState);

  // Hydrate from localStorage on first client render.
  useEffect(() => {
    const hydrateState = async () => {
      try {
        const savedState = await loadGameStateFromStorage();
        dispatch({
          type: 'HYDRATE',
          payload: {
            ...savedState,
            gameState: GAME_STATE.MENU,
            currentHealth: savedState.playerStats?.maxHealth ?? 3,
          },
        });
      } catch (_) {
        dispatch({ type: 'HYDRATE', payload: {} });
      }
    };

    hydrateState();
  }, []);

  // Persist to localStorage on state change, but only after hydration is complete.
  useEffect(() => {
    if (!state._hydrated) return;

    const saveState = async () => {
      try {
        const { _hydrated, gameState, currentHealth, ...toPersist } = state;
        await saveGameStateToStorage(toPersist);
      } catch (_) { /* handle error if needed */ }
    };

    saveState();
  }, [state]);

  const setGameState = useCallback((s: GAME_STATE) => dispatch({ type: 'SET_GAME_STATE', payload: s }), []);
  const addStreetCred = useCallback((n: number) => dispatch({ type: 'ADD_STREET_CRED', payload: n }), []);
  const setStreetCred = useCallback((n: number) => dispatch({ type: 'SET_STREET_CRED', payload: n }), []);
  const addScore = useCallback((n: number) => dispatch({ type: 'ADD_SCORE', payload: n }), []);
  const resetScore = useCallback(() => dispatch({ type: 'RESET_SCORE' }), []);
  const setHealth = useCallback((n: number) => dispatch({ type: 'SET_HEALTH', payload: n }), []);
  const purchaseItem = useCallback((id: string) => dispatch({ type: 'PURCHASE_ITEM', payload: id }), []);
  const resetRun = useCallback(() => dispatch({ type: 'RESET_RUN' }), []);
  const triggerGameOver = useCallback(() => dispatch({ type: 'GAME_OVER' }), []);
  const triggerVictory = useCallback(() => dispatch({ type: 'VICTORY' }), []);

  const value: StoreContextValue = {
    ...state,
    setGameState,
    addStreetCred,
    setStreetCred,
    addScore,
    resetScore,
    setHealth,
    purchaseItem,
    resetRun,
    triggerGameOver,
    triggerVictory,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// Throws if used outside provider — intentional guard.
export const useStore = (): StoreContextValue => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
};
