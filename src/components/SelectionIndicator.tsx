'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import RecommendationModal from './RecommendationModal';

export default function SelectionIndicator({ applicationFormType = 'standard' }: { applicationFormType?: string }) {
  const { favorites, MAX_FAVORITES, enableArtistMain, illustrationFavorites, MAX_ILLUST_FAVORITES, openHelp } = useFavorites();
  const isIllustrationMode = applicationFormType === 'illustration';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRecommendType, setInitialRecommendType] = useState<'song' | 'illustration' | null>(null);
  
  // Use appropriate favorites based on mode
  const currentFavorites = isIllustrationMode ? illustrationFavorites || [] : favorites;
  const currentMax = isIllustrationMode ? MAX_ILLUST_FAVORITES : MAX_FAVORITES;
  
  const count = currentFavorites.length;
  const isEnabled = count >= 5;

  const illustCount = illustrationFavorites ? illustrationFavorites.length : 0;
  // イラストは5枚以上で推薦可能とする
  const isIllustEnabled = illustCount >= 5;

  const handleOpenModal = (type: 'song' | 'illustration' | null) => {
    setInitialRecommendType(type);
    setIsModalOpen(true);
  };

  const renderSplitIndicator = () => (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[80] w-[96%] md:w-full max-w-3xl px-0 md:px-4">
      <div className="bg-surface/90 backdrop-blur-xl border-2 border-[var(--color-cyan-400)]/30 rounded-full p-1.5 md:p-3 flex flex-row items-center justify-between gap-1.5 md:gap-3 shadow-[0_0_40px_rgba(0,0,0,0.8)] border-b-cyan-500/60">
        
        <button
          onClick={openHelp}
          className="w-8 h-8 md:w-12 md:h-12 shrink-0 bg-gray-800/80 hover:bg-gray-700 text-[var(--color-cyan-400)] rounded-full flex items-center justify-center font-black text-lg md:text-2xl transition-all border border-[var(--color-cyan-400)]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          aria-label="使い方を見る"
          title="推しリストの作り方"
        >
          ?
        </button>

        {/* Song Section */}
        <div className="flex-1 flex items-center justify-between bg-black/30 rounded-full p-1 md:p-3 border border-white/5 h-10 md:h-auto overflow-hidden">
          <div className="pl-1.5 md:pl-2 flex items-baseline gap-0.5 md:gap-1 whitespace-nowrap">
            <span className="text-[10px] md:text-sm font-black text-[var(--color-cyan-400)] hidden sm:inline mr-1">楽曲</span>
            <span className="text-[11px] font-black text-[var(--color-cyan-400)] sm:hidden mr-0.5">🎵</span>
            <span className="text-sm md:text-2xl font-black text-foreground">{count}</span>
            <span className="text-foreground text-[9px] md:text-sm font-mono opacity-60">/{MAX_FAVORITES}</span>
          </div>
          <button
            onClick={() => handleOpenModal('song')}
            disabled={!isEnabled}
            className={`px-2.5 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[9px] md:text-sm transition-all shadow-lg whitespace-nowrap ${
              isEnabled 
                ? 'bg-gradient-to-r from-[var(--color-cyan-400)] to-blue-600 hover:from-[var(--color-cyan-400)] hover:to-[var(--color-cyan-500)] text-white shadow-cyan-500/20 active:scale-95 cursor-pointer' 
                : 'bg-gray-800 text-foreground cursor-not-allowed grayscale'
            }`}
          >
            {isEnabled ? '推薦' : `あと${5 - count}`}
          </button>
        </div>

        {/* Illustration Section */}
        <div className="flex-1 flex items-center justify-between bg-black/30 rounded-full p-1 md:p-3 border border-white/5 h-10 md:h-auto overflow-hidden">
          <div className="pl-1.5 md:pl-2 flex items-baseline gap-0.5 md:gap-1 whitespace-nowrap">
            <span className="text-[10px] md:text-sm font-black text-fuchsia-400 hidden sm:inline mr-1">イラスト</span>
            <span className="text-[11px] font-black text-fuchsia-400 sm:hidden mr-0.5">🖼️</span>
            <span className="text-sm md:text-2xl font-black text-foreground">{illustCount}</span>
            <span className="text-foreground text-[9px] md:text-sm font-mono opacity-60">/{MAX_ILLUST_FAVORITES}</span>
          </div>
          <button
            onClick={() => handleOpenModal('illustration')}
            disabled={!isIllustEnabled}
            className={`px-2.5 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[9px] md:text-sm transition-all shadow-lg whitespace-nowrap ${
              isIllustEnabled 
                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white shadow-fuchsia-500/20 active:scale-95 cursor-pointer' 
                : 'bg-gray-800 text-foreground cursor-not-allowed grayscale'
            }`}
          >
            {isIllustEnabled ? '推薦' : `あと${5 - illustCount}`}
          </button>
        </div>

      </div>
    </div>
  );

  const renderSingleIndicator = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-full max-w-2xl px-4">
      <div className="bg-surface/90 backdrop-blur-xl border-2 border-[var(--color-cyan-400)]/30 rounded-[2rem] p-4 flex items-center justify-between gap-3 shadow-[0_0_40px_rgba(0,0,0,0.8)] border-b-cyan-500/60">
        
        <button
          onClick={openHelp}
          className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-gray-800/80 hover:bg-gray-700 text-[var(--color-cyan-400)] rounded-full flex items-center justify-center font-black text-xl md:text-2xl transition-all border border-[var(--color-cyan-400)]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          aria-label="使い方を見る"
          title="推しリストの作り方"
        >
          ?
        </button>

        <div className="pl-2 flex flex-col">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--color-cyan-400)]">Selected</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground">{count}</span>
            <span className="text-foreground text-sm font-mono">/ {MAX_FAVORITES}</span>
          </div>
        </div>
        
        <div className="flex-1 px-6">
          {!isEnabled ? (
            <p className="text-[10px] text-foreground font-bold text-center leading-tight">
              あと <span className="text-[var(--color-cyan-400)]">{5 - count}{isIllustrationMode ? '作品' : '曲'}</span> 選択すると<br />推薦ページを作成できます
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
      {enableArtistMain && !isIllustrationMode ? renderSplitIndicator() : renderSingleIndicator()}
      <RecommendationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedIds={initialRecommendType === 'illustration' ? illustrationFavorites : favorites} 
        initialRecommendType={initialRecommendType}
      />
    </>
  );
}
