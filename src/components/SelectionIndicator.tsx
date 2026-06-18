'use client';

import React, { useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import RecommendationModal from './RecommendationModal';

export default function SelectionIndicator() {
  const { favorites, MAX_FAVORITES, enableArtistMain, illustrationFavorites, MAX_ILLUST_FAVORITES } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRecommendType, setInitialRecommendType] = useState<'song' | 'illustration' | null>(null);
  
  const count = favorites.length;
  const isEnabled = count >= 5;

  const illustCount = illustrationFavorites ? illustrationFavorites.length : 0;
  // イラストは5枚以上で推薦可能とする
  const isIllustEnabled = illustCount >= 5;

  if (count === 0 && (!enableArtistMain || illustCount === 0)) return null;

  const handleOpenModal = (type: 'song' | 'illustration' | null) => {
    setInitialRecommendType(type);
    setIsModalOpen(true);
  };

  const renderSplitIndicator = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-full max-w-2xl px-4">
      <div className="bg-surface/90 backdrop-blur-xl border-2 border-[var(--color-cyan-400)]/30 rounded-[2rem] p-3 flex flex-col md:flex-row items-center gap-3 shadow-[0_0_40px_rgba(0,0,0,0.8)] border-b-cyan-500/60">
        
        {/* Song Section */}
        <div className="flex-1 w-full flex items-center justify-between bg-black/30 rounded-2xl p-2 md:p-3 border border-white/5">
          <div className="pl-2 flex flex-col">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--color-cyan-400)]">楽曲</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black text-foreground">{count}</span>
              <span className="text-foreground text-xs md:text-sm font-mono">/ {MAX_FAVORITES}</span>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal('song')}
            disabled={!isEnabled}
            className={`px-4 md:px-6 py-2 rounded-xl font-black text-xs md:text-sm transition-all shadow-lg ${
              isEnabled 
                ? 'bg-gradient-to-r from-[var(--color-cyan-400)] to-blue-600 hover:from-[var(--color-cyan-400)] hover:to-[var(--color-cyan-500)] text-white shadow-cyan-500/20 active:scale-95 cursor-pointer' 
                : 'bg-gray-800 text-foreground cursor-not-allowed grayscale'
            }`}
          >
            {isEnabled ? '推薦する' : `あと${5 - count}曲`}
          </button>
        </div>

        {/* Illustration Section */}
        <div className="flex-1 w-full flex items-center justify-between bg-black/30 rounded-2xl p-2 md:p-3 border border-white/5">
          <div className="pl-2 flex flex-col">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-fuchsia-400">イラスト</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black text-foreground">{illustCount}</span>
              <span className="text-foreground text-xs md:text-sm font-mono">/ {MAX_ILLUST_FAVORITES}</span>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal('illustration')}
            disabled={!isIllustEnabled}
            className={`px-4 md:px-6 py-2 rounded-xl font-black text-xs md:text-sm transition-all shadow-lg ${
              isIllustEnabled 
                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white shadow-fuchsia-500/20 active:scale-95 cursor-pointer' 
                : 'bg-gray-800 text-foreground cursor-not-allowed grayscale'
            }`}
          >
            {isIllustEnabled ? '推薦する' : `あと${5 - illustCount}枚`}
          </button>
        </div>

      </div>
    </div>
  );

  const renderSingleIndicator = () => (
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
          onClick={() => handleOpenModal(null)}
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
  );

  return (
    <>
      {enableArtistMain ? renderSplitIndicator() : renderSingleIndicator()}
      <RecommendationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedIds={initialRecommendType === 'illustration' ? illustrationFavorites : favorites} 
        initialRecommendType={initialRecommendType}
      />
    </>
  );
}
