'use client';

import { useStore, GAME_STATE } from '@/context/StoreContext';
import { useEffect, useRef, useState } from 'react';

// Animated City Skyline
function CitySkyline() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    let frame = 0;
    let rafId;

    const buildings = Array.from({ length: 22 }, (_, i) => ({
      x: i * (W / 22),
      w: W / 22 - 1,
      h: 30 + Math.random() * 90,
      hue: 220 + i * 6,
      windows: Array.from({ length: 12 }, () => Math.random() > 0.38),
      signColor: ['#ff6600', '#cc00ff', '#00ccff'][i % 3],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Deep purple sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#060010');
      sky.addColorStop(0.7, '#110020');
      sky.addColorStop(1, '#1a0030');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Moon
      ctx.beginPath();
      ctx.arc(W * 0.82, 18, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffcc';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffaa';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Stars
      for (let s = 0; s < 30; s++) {
        const sx = ((s * 97 + frame * 0.2) % W);
        const sy = (s * 37) % (H * 0.5);
        const flicker = Math.sin(frame * 0.03 + s) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${flicker * 0.7})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Buildings
      buildings.forEach((b, idx) => {
        // Building body
        const bGrad = ctx.createLinearGradient(b.x, H - b.h, b.x + b.w, H);
        bGrad.addColorStop(0, `hsl(${b.hue},25%,10%)`);
        bGrad.addColorStop(1, `hsl(${b.hue},20%,6%)`);
        ctx.fillStyle = bGrad;
        ctx.fillRect(b.x, H - b.h, b.w, b.h);

        // Roof neon line
        ctx.fillStyle = b.signColor;
        ctx.shadowBlur = 4;
        ctx.shadowColor = b.signColor;
        ctx.fillRect(b.x, H - b.h, b.w, 1);
        ctx.shadowBlur = 0;

        // Windows
        b.windows.forEach((lit, wi) => {
          const wx = b.x + 3 + (wi % 3) * Math.floor((b.w - 6) / 3);
          const wy = H - b.h + 5 + Math.floor(wi / 3) * 14;
          if (wy >= H) return;
          const flicker = Math.sin(frame * 0.04 + wi * 0.7 + idx) > 0.88;
          if (lit || flicker) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = b.signColor;
            ctx.fillStyle = flicker ? '#ff8800' : b.signColor;
            ctx.globalAlpha = 0.75;
            ctx.fillRect(wx, wy, 5, 4);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          }
        });
      });

      // Neon ground glow
      const gGrad = ctx.createLinearGradient(0, H - 8, 0, H);
      gGrad.addColorStop(0, 'rgba(255,100,0,0.5)');
      gGrad.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, H - 8, W, 8);

      frame++;
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={200}
      className="absolute bottom-0 left-0 w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// Stat Badge
const StatBadge = ({ label, value, icon }) => (
  <div className="flex flex-col items-center px-5 py-3 rounded-2xl border border-orange-500/25 bg-orange-500/8 backdrop-blur-sm min-w-[90px]">
    <span className="text-lg mb-0.5">{icon}</span>
    <span className="text-xl font-black text-orange-300 leading-tight">{value}</span>
    <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">{label}</span>
  </div>
);

// Main Menu
export default function MainMenu() {
  const { setGameState, resetRun, streetCred, highScore, inventory } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#060010] flex flex-col items-center justify-center overflow-hidden select-none">

      {/* Floating background tags */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {['RUN', '🎨', 'CRED', '🔥', 'GRIND', '💀', 'SKATE', '⚡'].map((tag, i) => (
          <span
            key={i}
            className="absolute font-black text-orange-300/8 animate-float"
            style={{
              left: `${8 + i * 11}%`,
              top: `${10 + (i % 3) * 28}%`,
              fontSize: `${1.8 + (i % 4) * 0.5}rem`,
              animationDelay: `${i * 0.6}s`,
              transform: `rotate(${-20 + i * 10}deg)`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)' }}
        aria-hidden="true"
      />

      {/* City skyline at bottom */}
      <CitySkyline />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">

        {/* Title */}
        <div className="relative">
          <div className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white drop-shadow-[0_0_40px_rgba(255,100,0,0.6)]">
            URBAN STREET
          </div>
          <div className="text-4xl md:text-6xl font-black tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 drop-shadow-[0_0_20px_rgba(255,150,0,0.5)]">
            SCRAPPER
          </div>
          {/* Neon underline */}
          <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60" />
        </div>

        {/* Tagline */}
        <p className="text-orange-400/60 text-xs tracking-[0.5em] uppercase font-semibold">
          Run · Tag · Fight · Survive
        </p>

        {/* Stats row */}
        <div className="flex gap-3 flex-wrap justify-center">
          <StatBadge label="Street Cred" value={`$${streetCred}`} icon="💰" />
          <StatBadge label="High Score" value={highScore} icon="🏆" />
          <StatBadge label="Gear Owned" value={`${inventory.length}/4`} icon="🎒" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
          <button
            id="btn-play"
            onClick={resetRun}
            className="group w-full py-4 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-yellow-500 text-black font-black text-xl uppercase tracking-widest rounded-2xl transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_35px_rgba(255,150,0,0.55)] active:scale-95 border border-orange-300/30"
          >
            <span className="group-hover:animate-pulse">▶</span> PLAY
          </button>

          <button
            id="btn-shop"
            onClick={() => setGameState(GAME_STATE.SHOP)}
            className="w-full py-3 px-8 bg-transparent hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 font-black text-lg uppercase tracking-widest rounded-2xl transition-all duration-200 hover:scale-[1.03] border-2 border-purple-700/60 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(160,60,255,0.35)]"
          >
            🛒 SHOP
          </button>

          <button
            id="btn-reset-progress"
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 px-8 mt-2 bg-transparent hover:bg-red-900/40 text-red-500 hover:text-red-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 border border-red-900/50 hover:border-red-500"
          >
            Reset Progress
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-gray-600 text-[10px] tracking-wide mt-1">
          <span>A D / ← → &nbsp;Move</span>
          <span>W / ↑ &nbsp;Jump</span>
          <span>Space / F &nbsp;Attack</span>
          <span>G &nbsp;Graffiti Tag</span>
          <span>Shift + A/D or ←/→ &nbsp;Dash*</span>
          <span>ESC &nbsp;Menu</span>
        </div>
        <p className="text-gray-700 text-[9px]">* requires Rocket Kicks from Shop</p>

        <div className="flex flex-col items-center gap-1 mt-4">
          <span className="text-gray-800 text-[10px]">v1.0 — Urban Street Scrapper</span>
          <span className="text-gray-200 font-bold text-[9px] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Made with 💖 by Akhbarul Hadi (2026)</span>
        </div>
      </div>

      {/* Custom Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-[#110520] border border-red-900/50 p-6 rounded-2xl max-w-sm text-center shadow-[0_0_40px_rgba(255,0,0,0.2)]">
            <h2 className="text-xl font-black text-red-500 mb-3 uppercase tracking-widest">Warning</h2>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to reset all progress?<br /><br />
              <span className="text-red-400 font-semibold">This will permanently delete your high score, street cred, and gear.</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('urbanStreetScrapper');
                  window.location.reload();
                }}
                className="py-2 px-6 bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,0,0.4)]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
