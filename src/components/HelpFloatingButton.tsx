'use client';

import React, { useEffect, useRef } from 'react';
import { useFavorites } from '@/context/FavoritesContext';

export default function HelpFloatingButton() {
  const { hasSeenHelp, markHelpSeen, openHelp } = useFavorites();
  const hasAttemptedOpen = useRef(false);

  useEffect(() => {
    // 初回アクセス時に自動でモーダルを開く
    if (!hasSeenHelp && !hasAttemptedOpen.current) {
      hasAttemptedOpen.current = true;
      const timer = setTimeout(() => {
        openHelp();
      }, 800); // 少し遅延させてから表示
      return () => clearTimeout(timer);
    }
  }, [hasSeenHelp, openHelp]);

  return (
    <button
      onClick={openHelp}
      className="fixed bottom-24 right-4 md:right-8 md:bottom-28 z-[90] w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[var(--color-cyan-400)] to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 active:scale-95 transition-all group border-2 border-white/20"
      aria-label="推しリストの作り方（ヘルプ）"
      title="推しリストの作り方（ヘルプ）"
    >
      <span className="text-white text-xl md:text-2xl font-black italic">?</span>
      
      {/* ツールチップ（PC用） */}
      <span className="absolute right-full mr-4 bg-surface text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--color-cyan-400)]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
        推しリストの使い方
      </span>
    </button>
  );
}
