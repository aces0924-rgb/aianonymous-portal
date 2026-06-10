'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
  trackId: number;
}

export default function FavoriteButton({ trackId, compact = false }: FavoriteButtonProps & { compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(trackId);

  return (
    <button 
      onClick={() => toggleFavorite(trackId)}
      className={`flex items-center justify-center transition-all duration-300 active:scale-95 ${
        compact 
          ? `w-10 h-10 rounded-full border-2 ${favorite ? 'bg-[var(--color-cyan-500)] border-[var(--color-cyan-400)] text-black shadow-[0_0_15px_var(--color-glow)]' : 'bg-transparent border-surface-border text-foreground/50 hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)]/5'}`
          : `gap-0 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl border-2 font-bold text-base whitespace-nowrap ${
            favorite 
              ? 'bg-[var(--color-cyan-500)] border-[var(--color-cyan-400)] text-black shadow-[0_0_20px_var(--color-glow)]' 
              : 'bg-transparent border-surface-border text-foreground/50 hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)]/5'
          }`
      }`}
      title={favorite ? '推しに登録済み!' : '推し曲に選ぶ'}
    >
      <span className={compact ? "text-lg" : "text-xl"}>{favorite ? '💖' : '🤍'}</span>
      {!compact && <span className="hidden sm:inline">{favorite ? '推しに登録済み!' : '推し曲に選ぶ'}</span>}
    </button>
  );
}
