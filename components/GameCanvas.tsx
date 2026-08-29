'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore, GAME_STATE } from '@/context/StoreContext';
import HUD from '@/components/HUD';

export default function GameCanvas() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const mountedRef = useRef(false);
  const bridgeRef = useRef(null);
  const prevStateRef = useRef(GAME_STATE.PLAYING);

  // Stable ref to latest store — prevents stale closures in bridge callbacks.
  const storeRef = useRef(null);
  const store = useStore();
  storeRef.current = store;

  const { playerStats, gameState, setGameState } = store;

  // Ammo as React state so HUD re-renders when Phaser calls onAmmoChange.
  const [graffitiAmmo, setGraffitiAmmo] = useState(playerStats.graffitiAmmo);

  // Build bridge once (stable object, callbacks always read latest state via storeRef).
  if (!bridgeRef.current) {
    bridgeRef.current = {
      onEnemyKilled: (credAmount) => {
        storeRef.current?.addStreetCred(credAmount);
        storeRef.current?.addScore(credAmount * 10);
      },
      onPlayerHit: (newHealth) => {
        storeRef.current?.setHealth(newHealth);
      },
      onGameOver: () => {
        storeRef.current?.triggerGameOver();
      },
      onVictory: () => {
        storeRef.current?.triggerVictory();
      },
      onAmmoChange: (ammo) => {
        setGraffitiAmmo(ammo);
      },
      playerStats: { ...playerStats },
      gameState: gameState,
    };
  }

  useEffect(() => {
    if (!bridgeRef.current) return;
    bridgeRef.current.playerStats = { ...playerStats };
    bridgeRef.current.gameState = gameState;
    gameRef.current?.events.emit('playerStatsUpdated', playerStats);
  }, [playerStats, gameState]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setGameState(GAME_STATE.MENU);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setGameState]);

  useEffect(() => {
    let isCancelled = false;

    const initPhaser = async () => {
      if (!containerRef.current) return;

      const Phaser = (await import('phaser')).default;
      const { createPhaserConfig } = await import('@/lib/phaser/config');
      const BootScene = (await import('@/lib/phaser/scenes/BootScene')).default;
      const PreloadScene = (await import('@/lib/phaser/scenes/PreloadScene')).default;
      const MainScene = (await import('@/lib/phaser/scenes/MainScene')).default;

      if (isCancelled || !containerRef.current) return;

      const config = {
        ...createPhaserConfig(containerRef.current, bridgeRef.current),
        scene: [BootScene, PreloadScene, MainScene],
      };

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      isCancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div
        id="phaser-game"
        ref={containerRef}
        className="w-full h-full"
        aria-label="Game canvas"
      />
      <HUD graffitiAmmo={graffitiAmmo} />
    </div>
  );
}
