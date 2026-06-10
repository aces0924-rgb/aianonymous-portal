'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

export default function InterestedButton({ trackId, compact = false }: { trackId: number, compact?: boolean }) {
  const { isInterested, toggleInterested } = useFavorites();
  const interested = isInterested(trackId);

  return (
    <button
      onClick={() => toggleInterested(trackId)}
      className={`flex items-center justify-center transition-all active:scale-95 ${
        compact 
          ? `w-10 h-10 rounded-full border-2 ${interested ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-transparent border-surface-border text-gray-500 hover:border-amber-500/50 hover:text-amber-500/50'}`
          : `gap-0 sm:gap-3 px-3 sm:px-6 py-2.5 rounded-xl border-2 text-sm font-black uppercase tracking-widest ${
            interested 
              ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
              : 'bg-transparent border-surface-border text-gray-500 hover:border-amber-500/50 hover:text-amber-500/50'
          }`
      }`}
      title={interested ? '気になる済' : '気になる'}
    >
      <svg className="w-5 h-5" fill={interested ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {!compact && <span className="hidden sm:inline">{interested ? '気になる済' : '気になる'}</span>}
    </button>
  );
}
