'use client';

import { useStore, GAME_STATE } from '@/context/StoreContext';
import { useEffect, useRef } from 'react';

const HealthBar = ({ current, max }) => (
  <div className="flex items-center gap-1.5" role="status" aria-label={`Health: ${current} of ${max}`}>
    {Array.from({ length: max }, (_, i) => {
      const isFull = current - i >= 1;
      const isHalf = current - i === 0.5;

      return (
        <span
          key={i}
          className="relative text-xl leading-none select-none text-gray-800"
          aria-hidden="true"
        >
          ♥
          {(isFull || isHalf) && (
            <span
              className="absolute left-0 top-0 text-red-500 drop-shadow-[0_0_6px_rgba(255,50,50,0.9)] overflow-hidden transition-all duration-300"
              style={{ width: isFull ? '100%' : '50%' }}
            >
              ♥
            </span>
          )}
        </span>
      );
    })}
  </div>
);

const AmmoBar = ({ current, max }) => (
  <div className="flex items-center gap-1" role="status" aria-label={`Graffiti ammo: ${current} of ${max}`}>
    <span className="text-xs text-purple-400 mr-0.5 select-none" aria-hidden="true">🎨</span>
    {Array.from({ length: max }, (_, i) => (
      <span
        key={i}
        className={`inline-block w-2.5 h-2.5 rounded-full border transition-all duration-200 ${i < current
          ? 'bg-purple-500 border-purple-400 shadow-[0_0_5px_rgba(180,80,255,0.9)]'
          : 'bg-transparent border-gray-700'
          }`}
        aria-hidden="true"
      />
    ))}
  </div>
);

const ScoreDisplay = ({ score }) => {
  const prevScore = useRef(score);
  const flashRef = useRef(null);

  useEffect(() => {
    if (score !== prevScore.current && flashRef.current) {
      flashRef.current.classList.remove('scale-110', 'text-yellow-300');
      // Force reflow to restart the CSS transition from scratch.
      void flashRef.current.offsetWidth;
      flashRef.current.classList.add('scale-110', 'text-yellow-300');
      setTimeout(() => {
        flashRef.current?.classList.remove('scale-110', 'text-yellow-300');
      }, 300);
      prevScore.current = score;
    }
  }, [score]);

  return (
    <>
      <span
        ref={flashRef}
        className="text-2xl font-black text-white transition-all duration-150 drop-shadow-[0_0_10px_rgba(255,150,0,0.8)] select-none leading-none"
        aria-label={`Score: ${score}`}
      >
        {score.toLocaleString()}
      </span>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest select-none leading-none">Score</span>
    </>
  );
};

const CredDisplay = ({ streetCred }) => {
  const prevCred = useRef(streetCred);
  const bumpRef = useRef(null);

  useEffect(() => {
    if (streetCred !== prevCred.current && bumpRef.current) {
      bumpRef.current.classList.add('scale-125', 'text-yellow-300');
      setTimeout(() => {
        bumpRef.current?.classList.remove('scale-125', 'text-yellow-300');
      }, 300);
      prevCred.current = streetCred;
    }
  }, [streetCred]);

  return (
    <div className="flex items-center gap-1.5 bg-black/50 border border-orange-500/40 px-3 py-1 rounded-xl">
      <span className="text-orange-400 text-sm select-none" aria-hidden="true">💰</span>
      <span
        ref={bumpRef}
        className="text-orange-300 font-black text-sm transition-all duration-200 select-none"
        aria-label={`Street Cred: ${streetCred}`}
      >
        {streetCred}
      </span>
    </div>
  );
};

export default function HUD({ graffitiAmmo = 3 }) {
  const { currentHealth, playerStats, score, streetCred, setGameState } = useStore();

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none"
      role="complementary"
      aria-label="Game HUD"
    >
      <div className="flex items-start justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-black/70 to-transparent">

        <div className="flex flex-col gap-2 pointer-events-auto">
          <HealthBar current={currentHealth} max={playerStats.maxHealth} />
          <AmmoBar current={graffitiAmmo} max={playerStats.graffitiAmmo} />
        </div>

        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          <CredDisplay streetCred={streetCred} />
          <button
            id="hud-btn-menu"
            onClick={() => setGameState(GAME_STATE.MENU)}
            className="text-gray-600 hover:text-gray-300 text-[10px] uppercase tracking-widest transition-colors duration-150"
            title="Back to menu (ESC)"
          >
            ⏸ Menu
          </button>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <ScoreDisplay score={score} />

        {(playerStats.jumpBoost || playerStats.airDash) && (
          <div className="flex gap-3" aria-label="Active upgrades">
            {playerStats.jumpBoost && (
              <span className="text-[9px] font-bold text-green-400 bg-green-900/50 border border-green-500/30 px-2 py-0.5 rounded-full select-none leading-none">
                👟 DBL JUMP
              </span>
            )}
            {playerStats.airDash && (
              <span className="text-[9px] font-bold text-blue-400 bg-blue-900/50 border border-blue-500/30 px-2 py-0.5 rounded-full select-none leading-none">
                🚀 AIR DASH
              </span>
            )}
          </div>
        )}

        <ControlsHint />
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <span className="text-white font-bold text-[9px] uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Made with 💖 by Akhbarul Hadi (2026)
        </span>
      </div>
    </div>
  );
}

function ControlsHint() {
  const ref = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.opacity = '0';
        ref.current.style.transition = 'opacity 1s ease';
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-4 text-gray-500 text-[10px] select-none pointer-events-none"
      aria-hidden="true"
    >
      <span>A D / ← → Move</span>
      <span>W / ↑ Jump</span>
      <span>Space Attack</span>
      <span>F/G Graffiti (Stun)</span>
      <span>Shift Dash*</span>
      <span>ESC Menu</span>
    </div>
  );
}
