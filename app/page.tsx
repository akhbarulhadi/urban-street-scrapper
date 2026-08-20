'use client';

import { useStore, GAME_STATE } from '@/context/StoreContext';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MainMenu from '@/components/MainMenu';
import Shop from '@/components/Shop';
import GameOver from '@/components/GameOver';
import Victory from '@/components/Victory';

// GameCanvas must be SSR-disabled — Phaser uses browser-only APIs.
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-orange-400 font-black text-xl gap-4">
      <span className="text-5xl animate-spin" style={{ animationDuration: '2s' }}>🎮</span>
      <span className="animate-pulse">Initializing Engine…</span>
    </div>
  ),
});

// Root page — state router.
export default function Home() {
  const { gameState } = useStore();
  const [playSessionId, setPlaySessionId] = useState(0);

  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING) {
      setPlaySessionId(id => id + 1);
    }
  }, [gameState]);

  const isPlaying = gameState === GAME_STATE.PLAYING;
  const isGameOver = gameState === GAME_STATE.GAME_OVER;
  const isVictory = gameState === GAME_STATE.VICTORY;
  const showCanvas = isPlaying || isGameOver || isVictory;

  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-black">

      {/* Menu */}
      {gameState === GAME_STATE.MENU && <MainMenu />}

      {/* Shop */}
      {gameState === GAME_STATE.SHOP && <Shop />}

      {/*
        Game Canvas
        Unmounts when navigating to MENU/SHOP (Phaser fully destroyed).
        The key prop forces a full remount when transitioning GAME_OVER -> PLAYING.
      */}
      {showCanvas && <GameCanvas key={playSessionId} />}

      {/* Game Over overlay (above canvas) */}
      {isGameOver && <GameOver />}

      {/* Victory overlay (above canvas) */}
      {isVictory && <Victory />}

    </main>
  );
}
