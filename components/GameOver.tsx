'use client';

import { useStore, GAME_STATE } from '@/context/StoreContext';
import { useEffect, useState } from 'react';

function CountUp({ target, duration = 1200, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const interval = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);

  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

export default function GameOver() {
  const { score, highScore, streetCred, resetRun, setGameState } = useStore();
  const isNewHigh = score >= highScore && score > 0;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(40,0,0,0.97) 0%, rgba(5,0,15,0.99) 70%)',
        backdropFilter: 'blur(3px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Game Over"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(255,0,0,0.04) 4px,rgba(255,0,0,0.04) 5px)' }}
        aria-hidden="true"
      />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full blur-[80px] bg-red-600/20 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center animate-fade-in">

        <div>
          <div
            className="text-6xl md:text-8xl font-black tracking-tight text-red-500 drop-shadow-[0_0_40px_rgba(255,30,30,0.7)]"
            style={{ textShadow: '0 0 60px rgba(255,30,30,0.5), 0 0 120px rgba(255,0,0,0.3)' }}
          >
            GAME
          </div>
          <div
            className="text-6xl md:text-8xl font-black tracking-tight text-red-400 drop-shadow-[0_0_40px_rgba(255,30,30,0.7)]"
            style={{ textShadow: '0 0 60px rgba(255,30,30,0.5), 0 0 120px rgba(255,0,0,0.3)' }}
          >
            OVER
          </div>
        </div>

        {isNewHigh && (
          <div className="px-5 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-full animate-pulse">
            <span className="text-yellow-300 font-black text-sm tracking-widest uppercase">
              🏆 New High Score!
            </span>
          </div>
        )}

        <div className="flex gap-5 mt-1">
          <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Score</span>
            <span className="text-3xl font-black text-white">
              <CountUp target={score} duration={1000} />
            </span>
          </div>
          <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Best</span>
            <span className="text-3xl font-black text-orange-400">
              <CountUp target={highScore} duration={1200} />
            </span>
          </div>
          <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Cred</span>
            <span className="text-3xl font-black text-purple-400">
              <CountUp target={streetCred} prefix="$" duration={1400} />
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-xs italic">
          {streetCred >= 30
            ? 'Tip: You have enough cred for gear — visit the Shop!'
            : 'Tip: Use Graffiti to stun enemies before punching!'}
        </p>

        <div className="flex flex-col items-center gap-3 w-full max-w-[260px] mt-2">
          <button
            id="btn-retry"
            onClick={resetRun}
            className="w-full py-4 px-8 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-orange-500 text-white font-black text-xl uppercase tracking-widest rounded-2xl transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(255,60,60,0.5)] active:scale-95"
          >
            ▶ PLAY AGAIN
          </button>
          <button
            id="btn-shop-go"
            onClick={() => setGameState(GAME_STATE.SHOP)}
            className="w-full py-3 px-8 bg-transparent hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 font-black text-lg uppercase tracking-widest rounded-2xl transition-all duration-200 border-2 border-purple-700/60 hover:border-purple-500"
          >
            🛒 UPGRADE GEAR
          </button>
          <button
            id="btn-menu-go"
            onClick={() => setGameState(GAME_STATE.MENU)}
            className="w-full py-3 px-8 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white font-black text-lg uppercase tracking-widest rounded-2xl transition-all duration-200 border-2 border-gray-700 hover:border-gray-500"
          >
            🏠 GO TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}
