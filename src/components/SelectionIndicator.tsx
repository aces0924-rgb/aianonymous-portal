'use client';

import React, { useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import RecommendationModal from './RecommendationModal';

export default function SelectionIndicator() {
  const { favorites, MAX_FAVORITES } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const count = favorites.length;
  const isEnabled = count >= 5;

  if (count === 0) return null;

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-full max-w-lg px-4">
        <div className="bg-surface/90 backdrop-blur-xl border-2 border-[var(--color-cyan-400)]/30 rounded-[2rem] p-4 flex items-center justify-between shadow-[0_0_40px_rgba(0,0,0,0.8)] border-b-cyan-500/60">
          <div className="pl-4 flex flex-col">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--color-cyan-400)]">Selected</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">{count}</span>
              <span className="text-foreground text-sm font-mono">/ {MAX_FAVORITES}</span>
            </div>
          </div>
          
          <div className="flex-1 px-6">
            {!isEnabled ? (
              <p className="text-[10px] text-foreground font-bold text-center leading-tight">
                あと <span className="text-[var(--color-cyan-400)]">{5 - count}曲</span> 選択すると<br />推薦ページを作成できます
              </p>
            ) : (
              <p className="text-[10px] text-[var(--color-cyan-400)] font-bold text-center animate-pulse">
                素晴らしい！レコメンド可能です✨
              </p>
            )}
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!isEnabled}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${
              isEnabled 
                ? 'bg-gradient-to-r from-[var(--color-cyan-400)] to-[var(--color-cyan-600)] hover:from-[var(--color-cyan-400)] hover:to-[var(--color-cyan-600)] text-white shadow-cyan-500/20 active:scale-95 cursor-pointer' 
                : 'bg-gray-800 text-foreground cursor-not-allowed grayscale'
            }`}
          >
            推薦する
          </button>
        </div>
      </div>
      
      <RecommendationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedIds={favorites} 
      />
    </>
  );
}
