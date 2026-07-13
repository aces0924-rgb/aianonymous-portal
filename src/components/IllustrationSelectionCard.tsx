'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';
import SelectionCardProgress from './SelectionCardProgress';
import { encodeSelectionId } from '@/lib/id-utils';

interface SelectionCardProps {
  list: {
    id: number;
    userName: string;
    appeal: string | null;
    trackIds: string;
    createdAt: Date | string;
    userTotalSyncRate?: number;
    userTotalCount?: number;
    hasMultipleLists?: boolean;
  };
  previewQuery: string;
  enableArtistMain?: boolean;
}

export default function IllustrationSelectionCard({ list, previewQuery, enableArtistMain }: SelectionCardProps) {
  const { interested } = useFavorites();
  const params = useParams();
  const eventSlug = params?.eventSlug as string || '';
  const prefix = eventSlug ? `/${eventSlug}` : '';
  
  // 進捗計算
  const trackIds = list.trackIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  const totalCount = trackIds.length;
  const checkedCount = trackIds.filter(id => interested.includes(id)).length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  
  const isCompleted = percentage === 100;
  const hasStarted = percentage > 0;

  // 状態に応じたスタイル定義
  const borderClass = isCompleted 
    ? 'border-yellow-500/60 shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
    : hasStarted 
    ? 'border-[var(--color-cyan-400)]/50 shadow-[0_0_20px_var(--color-glow)]' 
    : 'border-surface-border';

  const bgClass = isCompleted 
    ? 'bg-gradient-to-br from-gray-900 via-yellow-950/10 to-gray-950' 
    : hasStarted 
    ? 'bg-gradient-to-br from-gray-900 via-[var(--color-cyan-400)]/5 to-gray-950' 
    : 'bg-surface/95';

  return (
    <Link 
      href={`${prefix}/selection/illustration/${encodeSelectionId(list.id)}${previewQuery}`}
      className={`group relative border ${borderClass} ${bgClass} rounded-[2.5rem] p-7 md:p-8 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] flex flex-col h-full overflow-hidden`}
    >
      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
        isCompleted ? 'bg-yellow-500/5' : 'bg-[var(--color-cyan-500)]/5'
      }`} />
      
      {/* Decorative accent orb */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-500 ${
        isCompleted ? 'bg-yellow-500/20' : hasStarted ? 'bg-[var(--color-cyan-500)]/15' : 'bg-purple-500/5'
      }`} />
      
      <div className="relative z-10 space-y-5 flex flex-col h-full">
        <div className="flex items-center justify-between">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 shadow-lg ${
             isCompleted ? 'bg-gradient-to-br from-yellow-400 to-amber-600 rotate-12' : 
             hasStarted ? 'bg-gradient-to-br from-[var(--color-cyan-400)] to-[var(--color-cyan-600)]' : 
             'bg-gradient-to-br from-purple-500 to-pink-500'
           }`}>
             {isCompleted ? '🏆' : '🎧'}
           </div>
           <span className="text-[11px] text-foreground font-black tracking-tighter uppercase ">
             {new Date(list.createdAt).toLocaleDateString('ja-JP')}
           </span>
        </div>

        <div className="space-y-1">
          <h2 className={`text-xl md:text-2xl font-black tracking-tighter leading-tight transition-colors duration-500 ${
            isCompleted ? 'text-yellow-400' : hasStarted ? 'text-white' : 'text-foreground'
          }`}>
            {list.userName} <span className="text-sm font-bold ">さんの推し{enableArtistMain ? 'クリエイター' : 'イラスト'}リスト</span>
          </h2>
        </div>

        {list.appeal ? (
          <div className="flex-grow pt-2">
            <p className={`text-sm md:text-base leading-relaxed line-clamp-4 italic border-l-4 pl-5 transition-colors duration-500 ${
              isCompleted ? 'text-foreground border-yellow-500/50' : 
              hasStarted ? 'text-foreground border-[var(--color-cyan-400)]/40' : 
              'text-foreground border-purple-500/20'
            }`}>
              "{list.appeal}"
            </p>
          </div>
        ) : (
          <div className="flex-grow pt-2">
            <p className="text-foreground text-sm italic">
              （想いの一欠片がここに眠っています...）
            </p>
          </div>
        )}

        {/* Progress Display Component */}
        <SelectionCardProgress 
          trackIdsStr={list.trackIds} 
          userTotalSyncRate={list.userTotalSyncRate}
          userTotalCount={list.userTotalCount}
          hasMultipleLists={list.hasMultipleLists}
        />

      </div>
    </Link>
  );
}
