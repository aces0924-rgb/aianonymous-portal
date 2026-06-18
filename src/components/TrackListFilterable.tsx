'use client';

import React, { useState, useMemo } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import TrackListCard from './TrackListCard';

interface TrackListFilterableProps {
  initialTracks: any[];
  preview?: string;
  enableArtistMain?: boolean;
  eventSlug: string;
  enableThumbSubmit?: boolean;
}

export default function TrackListFilterable({ initialTracks, preview, enableArtistMain, eventSlug, enableThumbSubmit = true }: TrackListFilterableProps) {
  const { interested, favorites, illustrationFavorites } = useFavorites();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const isIllustration = (url?: string) => {
    if (!url) return false;
    const isVideo = url.match(/(?:youtu\.be\/|youtube\.com\/|nicovideo\.jp\/|nico\.ms\/|suno\.com\/)/);
    if (isVideo) return false;
    return !!(url.match(/\.(jpeg|jpg|gif|png)$/i) || url.includes('pbs.twimg.com') || url.includes('gyazo.com'));
  };

  const unregisteredCount = useMemo(() => initialTracks.filter(t => !t.hasThumbnail).length, [initialTracks]);
  const musicCount = useMemo(() => initialTracks.filter(t => !isIllustration(t.songUrl)).length, [initialTracks]);
  const illustrationCount = useMemo(() => initialTracks.filter(t => isIllustration(t.songUrl)).length, [initialTracks]);

  const filteredTracks = useMemo(() => {
    if (activeFilters.length === 0) return initialTracks;

    return initialTracks.filter(track => {
      const isIllust = isIllustration(track.songUrl);
      const isMusic = !isIllust;

      // 種類フィルタのチェック（どちらか一方が選択されている場合のみ絞り込み）
      const hasMusicFilter = activeFilters.includes('music');
      const hasIllustFilter = activeFilters.includes('illustration');
      
      if (hasMusicFilter && !hasIllustFilter && !isMusic) return false;
      if (hasIllustFilter && !hasMusicFilter && !isIllust) return false;

      // 状態フィルタのチェック（すべて満たす AND検索）
      if (activeFilters.includes('interested') && !interested.includes(track.id)) return false;
      
      if (activeFilters.includes('favorites')) {
        const isFav = favorites.includes(track.id);
        const isIllustFav = enableArtistMain && illustrationFavorites ? illustrationFavorites.includes(track.id) : false;
        if (!isFav && !isIllustFav) return false;
      }
      
      if (activeFilters.includes('unregistered') && track.hasThumbnail) return false;

      return true;
    });
  }, [initialTracks, activeFilters, interested, favorites, illustrationFavorites, enableArtistMain]);

  return (
    <div className="space-y-8">
      {/* Filter UI */}
      <div className="flex justify-center">
        <div className="bg-surface/50 p-1.5 rounded-2xl border border-surface-border flex flex-wrap gap-2 backdrop-blur-sm justify-center">
          <button
            onClick={() => setActiveFilters([])}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeFilters.length === 0 
                ? 'bg-gray-800 text-white shadow-lg border border-surface-border' 
                : 'text-foreground hover:text-white'
            }`}
          >
            すべて表示 ({initialTracks.length})
          </button>
          
          {enableArtistMain && (
            <>
              <button
                onClick={() => toggleFilter('music')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeFilters.includes('music') 
                    ? 'bg-[var(--color-cyan-600)] text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                    : 'text-foreground hover:text-[var(--color-cyan-400)]'
                }`}
              >
                <span>🎵</span>
                音楽 ({musicCount})
              </button>

              <button
                onClick={() => toggleFilter('illustration')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeFilters.includes('illustration') 
                    ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]' 
                    : 'text-foreground hover:text-fuchsia-400'
                }`}
              >
                <span>🖼️</span>
                イラスト ({illustrationCount})
              </button>
            </>
          )}
          
          <button
            onClick={() => toggleFilter('interested')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeFilters.includes('interested') 
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                : 'text-foreground hover:text-amber-500'
            }`}
          >
            <span>⭐</span>
            気になる ({interested.length})
          </button>

          <button
            onClick={() => toggleFilter('favorites')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeFilters.includes('favorites') 
                ? 'bg-[var(--color-cyan-500)] text-black shadow-[0_0_15px_var(--color-glow)]' 
                : 'text-foreground hover:text-[var(--color-cyan-400)]'
            }`}
          >
            <span>💖</span>
            推し候補 ({enableArtistMain && illustrationFavorites ? favorites.length + illustrationFavorites.length : favorites.length})
          </button>

          {enableThumbSubmit && (
            <button
              onClick={() => toggleFilter('unregistered')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeFilters.includes('unregistered') 
                  ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' 
                  : 'text-foreground hover:text-green-400'
              }`}
            >
              <span>🎨</span>
              ファンアート募集中 ({unregisteredCount})
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start min-h-[400px]">
        {filteredTracks.map((track) => (
          <TrackListCard 
            key={track.id} 
            track={track} 
            preview={preview} 
            enableArtistMain={enableArtistMain} 
            eventSlug={eventSlug}
          />
        ))}
        
        {filteredTracks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-surface-border rounded-[3rem] space-y-4 animate-in fade-in duration-700">
            <span className="text-5xl opacity-20">
              {activeFilters.includes('interested') ? '⭐' : activeFilters.includes('favorites') ? '💖' : activeFilters.includes('music') ? '🎵' : activeFilters.includes('illustration') ? '🖼️' : '🎨'}
            </span>
            <p className="text-foreground font-bold tracking-[0.2em] uppercase text-sm text-center">
              {activeFilters.includes('interested') 
                ? '気になる作品はまだありません' 
                : activeFilters.includes('favorites') 
                  ? '推し候補はまだありません' 
                  : activeFilters.includes('music')
                    ? '該当する音楽作品がありません'
                    : activeFilters.includes('illustration')
                      ? '該当するイラスト作品がありません'
                      : '作品が見つかりませんでした'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
