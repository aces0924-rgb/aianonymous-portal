'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

export default function ClearFavoritesButton() {
  const { favorites, clearFavorites, enableArtistMain, illustrationFavorites, clearIllustrationFavorites } = useFavorites();

  const hasFavorites = favorites.length > 0;
  const hasIllustFavorites = enableArtistMain && illustrationFavorites && illustrationFavorites.length > 0;

  if (!hasFavorites && !hasIllustFavorites) return null;

  return (
    <div className="no-text-outline no-text-shadow flex flex-col sm:flex-row items-center justify-center gap-2">
      {hasFavorites && (
        <button
          onClick={() => {
            const msg = enableArtistMain 
              ? '選択中の「楽曲の推し」をすべて解除してもよろしいですか？'
              : '選択中の「推し」をすべて解除してもよろしいですか？';
            if (confirm(msg)) {
              clearFavorites();
            }
          }}
          className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 text-xs font-black tracking-widest uppercase hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
          </svg>
          {enableArtistMain ? '楽曲の推しを一括解除' : '推し済を一括解除'}
        </button>
      )}

      {hasIllustFavorites && (
        <button
          onClick={() => {
            if (confirm('選択中の「イラストの推し」をすべて解除してもよろしいですか？')) {
              clearIllustrationFavorites();
            }
          }}
          className="px-6 py-2 rounded-full border border-fuchsia-500/30 text-fuchsia-400 text-xs font-black tracking-widest uppercase hover:bg-fuchsia-500/10 hover:border-fuchsia-500 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
          </svg>
          イラストの推しを一括解除
        </button>
      )}
    </div>
  );
}
