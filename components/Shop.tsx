'use client';

import { useStore, SHOP_ITEMS, GAME_STATE } from '@/context/StoreContext';
import { useState } from 'react';

const ShopItemCard = ({ item, owned, canAfford, onBuy }) => {
  const [pulse, setPulse] = useState(false);

  const handleClick = () => {
    if (owned || !canAfford) return;
    setPulse(true);
    onBuy(item.id);
    setTimeout(() => setPulse(false), 400);
  };

  const borderColor = owned
    ? 'border-green-500/60'
    : canAfford
      ? 'border-orange-500/60'
      : 'border-gray-700/40';

  const bgColor = owned
    ? 'bg-green-900/20'
    : canAfford
      ? 'bg-orange-900/20 hover:bg-orange-900/30'
      : 'bg-gray-900/20 opacity-50';

  return (
    <article
      className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${borderColor} ${bgColor} ${!owned && canAfford ? 'cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(255,120,0,0.3)]' : 'cursor-not-allowed'
        } ${pulse ? 'scale-95' : ''}`}
      onClick={handleClick}
      aria-disabled={owned || !canAfford}
      role="button"
      tabIndex={owned || !canAfford ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {owned && (
        <span className="absolute top-3 right-3 text-xs font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded-full border border-green-500/50">
          OWNED ✓
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">{item.icon}</span>
        <div>
          <h3 className="font-black text-white text-lg leading-tight">{item.name}</h3>
          <p className="text-gray-400 text-sm mt-0.5">{item.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className={`font-black text-xl ${canAfford && !owned ? 'text-orange-400' : 'text-gray-500'}`}>
          ${item.price}
          <span className="text-xs font-normal text-gray-500 ml-1">CRED</span>
        </span>
        {!owned && (
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full border ${canAfford
                ? 'text-orange-300 border-orange-500/50 bg-orange-500/10'
                : 'text-gray-500 border-gray-700/50'
              }`}
          >
            {canAfford ? 'BUY' : 'INSUFFICIENT'}
          </span>
        )}
      </div>
    </article>
  );
};

const Toast = ({ message }) =>
  message ? (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-700/90 border border-green-400/60 rounded-2xl text-green-100 font-bold text-sm shadow-xl animate-bounce-in">
      {message}
    </div>
  ) : null;

export default function Shop() {
  const { streetCred, inventory, purchaseItem, setGameState } = useStore();
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleBuy = (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    if (inventory.includes(itemId)) { showToast('Already owned!'); return; }
    if (streetCred < item.price) { showToast('Not enough Street Cred!'); return; }
    purchaseItem(itemId);
    showToast(`${item.icon} ${item.name} equipped!`);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(#ff6600 1px, transparent 1px), linear-gradient(90deg, #ff6600 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {['UPGRADE', '👟', 'MAX', '🚀', 'HP+', '🎨', 'GEAR'].map((tag, i) => (
          <span
            key={i}
            className="absolute font-black text-purple-500/10 animate-float"
            style={{
              left: `${10 + i * 14}%`,
              top: `${15 + (i % 3) * 30}%`,
              fontSize: `${1.5 + (i % 3) * 0.5}rem`,
              animationDelay: `${i * 0.4}s`,
              transform: `rotate(${-15 + i * 15}deg)`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <Toast message={toast} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400 drop-shadow-[0_0_15px_rgba(200,100,255,0.4)]">
              🛒 STREET SHOP
            </h2>
            <p className="text-purple-400/80 text-xs tracking-widest uppercase mt-1">Upgrade your gear, level your game</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-orange-900/30 border border-orange-500/40 px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="text-orange-400 text-xl animate-bounce-in">💰</span>
              <span className="text-orange-300 font-black text-2xl drop-shadow-[0_0_8px_rgba(255,150,0,0.6)]">{streetCred}</span>
              <span className="text-orange-500/70 text-sm">CRED</span>
            </div>
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">{inventory.length}/{SHOP_ITEMS.length} items owned</span>
          </div>
        </header>

        <div className="h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent mb-8" aria-hidden="true" />

        <section aria-label="Shop items" className="flex flex-col gap-4">
          {SHOP_ITEMS.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              owned={inventory.includes(item.id)}
              canAfford={streetCred >= item.price}
              onBuy={handleBuy}
            />
          ))}
        </section>

        <div className="flex gap-3 mt-10">
          <button
            id="btn-shop-back-menu"
            onClick={() => setGameState(GAME_STATE.MENU)}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 font-bold uppercase tracking-widest transition-all duration-200 hover:bg-gray-900"
          >
            ← Menu
          </button>
          <button
            id="btn-shop-play"
            onClick={() => setGameState(GAME_STATE.PLAYING)}
            className="flex-1 py-3 rounded-2xl border-2 border-orange-500 bg-orange-500/20 text-orange-300 hover:bg-orange-500/40 hover:text-white font-black uppercase tracking-widest transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,120,0,0.4)]"
          >
            ▶ Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
