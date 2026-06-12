'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

interface SelectionCardProgressProps {
  trackIdsStr: string;
  userTotalSyncRate?: number;
  userTotalCount?: number;
  hasMultipleLists?: boolean;
}

export default function SelectionCardProgress({ 
  trackIdsStr, 
  userTotalSyncRate, 
  userTotalCount, 
  hasMultipleLists 
}: SelectionCardProgressProps) {
  const { interested } = useFavorites();
  
  // trackIdsStr は "1,2,3" のような形式
  const trackIds = trackIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  const isMulti = hasMultipleLists === true && typeof userTotalCount === 'number';
  const totalCount = isMulti ? userTotalCount : trackIds.length;
  
  if (totalCount === 0) return null;
  
  const checkedCount = isMulti && typeof userTotalSyncRate === 'number'
    ? Math.round(userTotalSyncRate * userTotalCount!) 
    : trackIds.filter(id => interested.includes(id)).length;
    
  const percentage = Math.round((checkedCount / totalCount) * 100);
  
  const isCompleted = percentage === 100;
  const hasStarted = percentage > 0;

  return (
    <div className="mt-4 pt-4 border-t border-surface-border/50 flex items-center justify-between">
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-end mb-1">
          <span className={`text-xs font-black tracking-widest uppercase transition-colors duration-500 ${
            isCompleted ? 'text-yellow-500' : hasStarted ? 'text-[var(--color-cyan-400)]' : 'text-foreground'
          }`}>
            {isCompleted ? 'シンクロ 100%' : hasMultipleLists ? '合計シンクロ率' : '好みのシンクロ率'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono transition-all duration-500 ${
              isCompleted ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-110' : 
              hasStarted ? 'text-[var(--color-cyan-400)] drop-shadow-[0_0_20px_var(--color-glow)]' : 'text-foreground'
            }`}>
              {percentage}%
            </span>
            <span className="text-[10px] md:text-xs font-black text-foreground bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
              全 {totalCount} 曲中 {checkedCount} 曲一致
            </span>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              isCompleted ? 'bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 animate-pulse' : 
              hasStarted ? 'bg-gradient-to-r from-purple-600 to-[var(--color-cyan-400)] shadow-[0_0_20px_var(--color-glow)]' : 
              'bg-gray-800'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
