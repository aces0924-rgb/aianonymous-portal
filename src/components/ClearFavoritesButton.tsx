'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

export default function ClearFavoritesButton() {
  const { favorites, clearFavorites } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <button
      onClick={() => {
        if (confirm('選択中の「推し曲」をすべて解除してもよろしいですか？')) {
          clearFavorites();
        }
      }}
      className="mt-4 px-6 py-2 rounded-full border border-red-500/30 text-red-400 text-xs font-black tracking-widest uppercase hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-95 flex items-center gap-2 mx-auto"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
      </svg>
      推し済を一括解除
    </button>
  );
}
