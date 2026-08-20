'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore, GAME_STATE } from '@/context/StoreContext';
import HUD from '@/components/HUD';

// GameCanvas — mounts a Phaser game instance inside a React component.
export default function GameCanvas() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const mountedRef = useRef(false);
  const bridgeRef = useRef(null);
  const prevStateRef = useRef(GAME_STATE.PLAYING);

  // Stable ref to latest store — prevents stale closures in bridge callbacks
  const storeRef = useRef(null);
  const store = useStore();
  storeRef.current = store;

  const { playerStats, gameState, setGameState } = store;

  // Ammo as React state so HUD re-renders when Phaser calls onAmmoChange
  const [graffitiAmmo, setGraffitiAmmo] = useState(playerStats.graffitiAmmo);

  // Build bridge once (stable object, callbacks always fresh via storeRef)
  if (!bridgeRef.current) {
    bridgeRef.current = {
      // Phaser → React: enemy killed, add cred + score
      onEnemyKilled: (credAmount) => {
        storeRef.current?.addStreetCred(credAmount);
        storeRef.current?.addScore(credAmount * 10);
      },
      // Phaser → React: player health changed
      onPlayerHit: (newHealth) => {
        storeRef.current?.setHealth(newHealth);
      },
      // Phaser → React: game over
      onGameOver: () => {
        storeRef.current?.triggerGameOver();
      },
      // Phaser → React: victory
      onVictory: () => {
        storeRef.current?.triggerVictory();
      },
      // Phaser → React: ammo changed — triggers HUD re-render
      onAmmoChange: (ammo) => {
        setGraffitiAmmo(ammo);
      },
      // React → Phaser: current state (read by Phaser each frame)
      playerStats: { ...playerStats },
      gameState: gameState,
    };
  }

  // Sync bridge.playerStats on every shop purchase
  useEffect(() => {
    if (!bridgeRef.current) return;
    bridgeRef.current.playerStats = { ...playerStats };
    bridgeRef.current.gameState = gameState;
    // Notify active Phaser scene
    gameRef.current?.events.emit('playerStatsUpdated', playerStats);
  }, [playerStats, gameState]);



  // ESC → Menu
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setGameState(GAME_STATE.MENU);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setGameState]);

  // Mount Phaser
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
      {/* Phaser mounts its canvas here */}
      <div
        id="phaser-game"
        ref={containerRef}
        className="w-full h-full"
        aria-label="Game canvas"
      />
      {/* React HUD — overlaid above canvas, re-renders independently */}
      <HUD graffitiAmmo={graffitiAmmo} />
    </div>
  );
}
