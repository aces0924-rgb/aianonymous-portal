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

  const titleNotFavorite = '推しに選ぶ';
  const titleFavorite = '推しに選択済み';

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
          ? `w-10 h-10 rounded-full border-2 ${favorite ? 'bg-pink-700 border-pink-300 text-white shadow-lg' : 'bg-rose-500 border-rose-200 text-white hover:bg-pink-500 shadow-md'}`
          : `gap-0 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl border-2 font-bold text-base whitespace-nowrap ${
            favorite 
              ? 'bg-pink-700 border-pink-300 text-white shadow-lg'
              : 'bg-rose-500 border-rose-200 text-white hover:bg-pink-500 shadow-md'
          }`
      }`}
      title={favorite ? titleFavorite : titleNotFavorite}
    >
      <span className={compact ? "text-lg" : "text-xl"}>{favorite ? '💖' : '🤍'}</span>
      {!compact && <span className="hidden sm:inline">{favorite ? titleFavorite : titleNotFavorite}</span>}
    </button>
  );
}
