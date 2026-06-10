'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

interface ScheduleItemProgressProps {
  trackIds: number[];
  size?: 'normal' | 'large';
}

export default function ScheduleItemProgress({ trackIds, size = 'normal' }: ScheduleItemProgressProps) {
  const { interested } = useFavorites();
  
  const totalCount = trackIds.length;
  if (totalCount === 0) return null;

  const matchedCount = trackIds.filter(id => interested.includes(id)).length;
  const percentage = Math.round((matchedCount / totalCount) * 100);

  if (matchedCount === 0) return null;

  const isPerfect = percentage === 100;

  if (size === 'large') {
    return (
      <div className={`flex items-center justify-between px-8 py-5 rounded-2xl border transition-all duration-500 w-full ${
        isPerfect 
          ? 'border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_25px_rgba(250,204,21,0.25)]' 
          : 'border-white/5 bg-neutral-900/80'
      }`}>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-black tracking-widest uppercase whitespace-nowrap ${
            isPerfect ? 'text-yellow-400' : 'text-neutral-500'
          }`}>
            気になる曲数
          </span>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <span className="text-sm font-bold text-neutral-400 whitespace-nowrap hidden md:inline">
            全 {totalCount} 曲中
          </span>
        </div>
        <div className="flex items-baseline gap-2 shrink-0 ml-4">
          <span className={`text-5xl font-black font-mono leading-none tracking-tighter ${
            isPerfect ? 'text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'text-amber-400'
          }`}>
            {matchedCount}
          </span>
          <span className={`text-xl font-bold ${isPerfect ? 'text-yellow-400/60' : 'text-amber-400/60'}`}>曲</span>
        </div>
      </div>
    );
  }

  // タイムライン用の2段コンパクト表示 (カード右上用)
  return (
    <div className={`inline-flex items-center gap-4 px-4 py-2 rounded-2xl border transition-all duration-500 ${
      isPerfect 
        ? 'border-yellow-400/40 bg-yellow-400/10 shadow-yellow-500/10' 
        : 'border-white/10 bg-neutral-900/80'
    }`}>
      <div className="flex flex-col -space-y-0.5">
        <span className={`text-[11px] font-black tracking-widest uppercase whitespace-nowrap ${
          isPerfect ? 'text-yellow-400' : 'text-neutral-500'
        }`}>
          気になる
        </span>
        <span className="text-xs font-bold text-neutral-400/80 whitespace-nowrap">
          {matchedCount}/{totalCount}曲
        </span>
      </div>
      <div className={`text-2xl font-black font-mono leading-none ${
        isPerfect ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-amber-400'
      }`}>
        {matchedCount}<span className="text-xs ml-0.5 opacity-60">曲</span>
      </div>
    </div>
  );
}
