import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FloatingXpBurst() {
  const { lastXpBurst, setLastXpBurst } = useApp();
  const [activeBurst, setActiveBurst] = useState(null);

  useEffect(() => {
    if (lastXpBurst && lastXpBurst.id) {
      setActiveBurst(lastXpBurst);
      const timer = setTimeout(() => {
        setActiveBurst(null);
        if (setLastXpBurst) setLastXpBurst(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [lastXpBurst, setLastXpBurst]);

  if (!activeBurst) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
      <div className="xp-particle-toast flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_30px_rgba(234,179,8,0.7)] border-2 border-yellow-200">
        <Sparkles className="w-5 h-5 animate-spin text-amber-900" />
        <span className="text-base tracking-tight font-black">
          +{activeBurst.amount} XP
        </span>
        {activeBurst.reason && (
          <span className="text-xs font-bold opacity-90 border-l border-amber-950/20 pl-2">
            {activeBurst.reason}
          </span>
        )}
        <Trophy className="w-4 h-4 text-amber-900" />
      </div>
    </div>
  );
}
