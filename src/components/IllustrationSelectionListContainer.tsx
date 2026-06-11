'use client';

import React, { useState, useMemo } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import IllustrationSelectionCard from './IllustrationSelectionCard';

interface Playlist {
  id: number;
  userName: string;
  appeal: string | null;
  trackIds: string;
  createdAt: Date | string;
}

interface IllustrationSelectionListContainerProps {
  initialPlaylists: Playlist[];
  previewQuery: string;
  enableArtistMain?: boolean;
}

type SortMode = 'newest' | 'sync' | 'match';

export default function IllustrationSelectionListContainer({ initialPlaylists, previewQuery, enableArtistMain }: IllustrationSelectionListContainerProps) {
  const { interested } = useFavorites();
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // ユーザー名を名寄せ用に正規化する関数
  const normalizeName = (name: string) => name.replace(/\s+/g, '').toLowerCase();

  // 表示用と集計用のすべてをマージして統計を計算
  const userStats = useMemo(() => {
    const stats: Record<string, { allTrackIds: number[] }> = {};
    const combinedData = [...initialPlaylists];
    
    combinedData.forEach(list => {
      const key = normalizeName(list.userName);
      const ids = list.trackIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (!stats[key]) {
        stats[key] = { allTrackIds: [] };
      }
      const combined = Array.from(new Set([...stats[key].allTrackIds, ...ids]));
      stats[key].allTrackIds = combined;
    });
    return stats;
  }, [initialPlaylists]);

  // 名寄せして一意のユーザーごとの代表リスト（最新のもの）を取得
  const uniquePlaylists = useMemo(() => {
    const map = new Map<string, Playlist>();
    initialPlaylists.forEach(list => {
      const key = normalizeName(list.userName);
      if (!map.has(key)) {
        map.set(key, list);
      }
    });
    return Array.from(map.values());
  }, [initialPlaylists]);

  // 各プレイリストのシンクロ率を計算し、ソートした結果をメモ化
  const sortedPlaylists = useMemo(() => {
    const playlistsWithSync = uniquePlaylists.map(list => {
      const key = normalizeName(list.userName);
      const trackIds = list.trackIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      const totalCount = trackIds.length;
      const checkedCount = trackIds.filter(id => interested.includes(id)).length;
      const syncRate = totalCount > 0 ? (checkedCount / totalCount) : 0;

      // ユーザー全体の統計を取得
      const userAllTracks = userStats[key]?.allTrackIds || [];
      const userTotalCount = userAllTracks.length;
      const userTotalCheckedCount = userAllTracks.filter(id => interested.includes(id)).length;
      const userTotalSyncRate = userTotalCount > 0 ? (userTotalCheckedCount / userTotalCount) : 0;
      
      // 同じユーザー（正規化後）のリストが他にもあるかチェック
      const isMultiUser = [...initialPlaylists].filter(p => normalizeName(p.userName) === key).length > 1;

      return { 
        ...list, 
        syncRate, 
        userTotalSyncRate, 
        userTotalCount, 
        userTotalCheckedCount,
        hasMultipleLists: isMultiUser 
      };
    });

    if (sortMode === 'sync') {
      return [...playlistsWithSync].sort((a, b) => {
        if (b.userTotalSyncRate !== a.userTotalSyncRate) {
          return b.userTotalSyncRate - a.userTotalSyncRate;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    if (sortMode === 'match') {
      return [...playlistsWithSync].sort((a, b) => {
        // 一致した曲数（絶対数）が多い順
        if (b.userTotalCheckedCount !== a.userTotalCheckedCount) {
          return b.userTotalCheckedCount - a.userTotalCheckedCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // デフォルト: 新着順
    return [...playlistsWithSync].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [initialPlaylists, interested, sortMode, userStats]);

  return (
    <div className="space-y-10">
      {/* Header Info & Sort Buttons Row */}
      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">
        {/* Left: Explanation Box */}
        <div className="flex-1 max-w-xl bg-[var(--color-glow)]/10 border border-[var(--color-glow)]/30 rounded-[2rem] p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-5 text-left">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-glow)]/20 flex items-center justify-center text-2xl">
              💡
            </div>
            <p className="text-foreground text-sm md:text-lg font-bold leading-tight">
              あなたが<span className="text-[var(--color-cyan-400)] font-black px-1">「気になる」</span>した{enableArtistMain ? '参加者' : 'イラスト'}との一致度を<br className="hidden md:block" />
              <span className="text-[var(--color-cyan-400)] font-black">「シンクロ率」</span>として表示しています。
            </p>
          </div>
        </div>

        {/* Right: Sort Group */}
        <div className="shrink-0 space-y-3 flex flex-col items-center lg:items-end">
          <p className="text-[var(--color-cyan-300)] text-xs md:text-sm font-black tracking-widest bg-[var(--color-glow)]/10 py-1.5 px-4 rounded-full border border-[var(--color-glow)]/20">
            自分と感性が近い人を探してみましょう！
          </p>
          
          <div className="inline-flex p-1 bg-surface/50 border border-surface-border rounded-2xl backdrop-blur-md shadow-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setSortMode('newest')}
              className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all whitespace-nowrap ${
                sortMode === 'newest' 
                  ? 'bg-[var(--color-cyan-500)] text-white shadow-lg shadow-[var(--color-cyan-500)]/20' 
                  : 'text-gray-500 hover:text-foreground/80'
              }`}
            >
              新着順
            </button>
            <button
              onClick={() => setSortMode('sync')}
              className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                sortMode === 'sync' 
                  ? 'bg-[var(--color-cyan-500)] text-white shadow-lg shadow-cyan-600/20' 
                  : 'text-gray-500 hover:text-foreground/80'
              }`}
            >
              <span className={sortMode === 'sync' ? 'animate-pulse' : ''}>✨</span>
              シンクロ率順
            </button>
            <button
              onClick={() => setSortMode('match')}
              className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                sortMode === 'match' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'text-gray-500 hover:text-foreground/80'
              }`}
            >
              <span className={sortMode === 'match' ? 'animate-bounce' : ''}>🔥</span>
              一致数順
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {sortedPlaylists.map((list) => (
          <IllustrationSelectionCard 
            key={list.id} 
            list={list} 
            previewQuery={previewQuery} 
            enableArtistMain={enableArtistMain}
          />
        ))}
      </div>

      {sortedPlaylists.length === 0 && (
        <div className="text-center py-20 bg-surface/20 border border-dashed border-surface-border rounded-[3rem]">
          <p className="text-gray-500">まだリストが登録されていません。</p>
        </div>
      )}
    </div>
  );
}
