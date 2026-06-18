'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
  trackId: number;
  enableArtistMain?: boolean;
  isImg?: boolean;
}

export default function FavoriteButton({ trackId, compact = false, enableArtistMain = false, isImg = false }: FavoriteButtonProps & { compact?: boolean }) {
  const { isFavorite, toggleFavorite, isIllustrationFavorite, toggleIllustrationFavorite, enableArtistMain: contextEnableArtistMain } = useFavorites();
  
  const effectiveEnableArtistMain = enableArtistMain || contextEnableArtistMain;
  const favorite = isImg && effectiveEnableArtistMain ? isIllustrationFavorite(trackId) : isFavorite(trackId);

  const titleNotFavorite = effectiveEnableArtistMain ? (isImg ? '推しイラストに選ぶ' : '推し人に選ぶ') : '推し曲に選ぶ';
  const titleFavorite = effectiveEnableArtistMain ? (isImg ? '推しイラストに登録済み!' : '推し人に登録済み!') : '推し曲に登録済み!';

  const handleToggle = () => {
    if (isImg && effectiveEnableArtistMain) {
      toggleIllustrationFavorite(trackId);
    } else {
      toggleFavorite(trackId);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`flex items-center justify-center transition-all duration-300 active:scale-95 ${
        compact 
          ? `w-10 h-10 rounded-full border-2 ${favorite ? 'bg-[var(--color-cyan-500)] border-[var(--color-cyan-400)] text-black shadow-[0_0_15px_var(--color-glow)]' : 'bg-transparent border-surface-border text-foreground hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)]/5'}`
          : `gap-0 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl border-2 font-bold text-base whitespace-nowrap ${
            favorite 
              ? 'bg-[var(--color-cyan-500)] border-[var(--color-cyan-400)] text-black shadow-[0_0_20px_var(--color-glow)]' 
              : 'bg-transparent border-surface-border text-foreground hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)]/5'
          }`
      }`}
      title={favorite ? titleFavorite : titleNotFavorite}
    >
      <span className={compact ? "text-lg" : "text-xl"}>{favorite ? '💖' : '🤍'}</span>
      {!compact && <span className="hidden sm:inline">{favorite ? titleFavorite : titleNotFavorite}</span>}
    </button>
  );
}
