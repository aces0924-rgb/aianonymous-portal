'use client';

import React, { useState, useMemo } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import TrackListCard from './TrackListCard';

interface TrackListFilterableProps {
  initialTracks: any[];
  preview?: string;
  enableArtistMain?: boolean;
  eventSlug: string;
}

export default function TrackListFilterable({ initialTracks, preview, enableArtistMain, eventSlug }: TrackListFilterableProps) {
  const { interested, favorites } = useFavorites();
  const [filterMode, setFilterMode] = useState<'all' | 'interested' | 'favorites' | 'unregistered' | 'music' | 'illustration'>('all');

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
    if (filterMode === 'all') return initialTracks;
    if (filterMode === 'interested') return initialTracks.filter(track => interested.includes(track.id));
    if (filterMode === 'favorites') return initialTracks.filter(track => favorites.includes(track.id));
    if (filterMode === 'unregistered') return initialTracks.filter(track => !track.hasThumbnail);
    if (filterMode === 'music') return initialTracks.filter(track => !isIllustration(track.songUrl));
    if (filterMode === 'illustration') return initialTracks.filter(track => isIllustration(track.songUrl));
    return initialTracks;
  }, [initialTracks, filterMode, interested, favorites]);

  return (
    <div className="space-y-8">
      {/* Filter UI */}
      <div className="flex justify-center">
        <div className="bg-surface/50 p-1.5 rounded-2xl border border-surface-border flex flex-wrap gap-2 backdrop-blur-sm justify-center">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              filterMode === 'all' 
                ? 'bg-gray-800 text-white shadow-lg border border-surface-border' 
                : 'text-gray-500 hover:text-foreground/80'
            }`}
          >
            すべて表示 ({initialTracks.length})
          </button>
          
          {enableArtistMain && (
            <>
              <button
                onClick={() => setFilterMode('music')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  filterMode === 'music' 
                    ? 'bg-[var(--color-cyan-600)] text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                    : 'text-gray-500 hover:text-[var(--color-cyan-400)]/50'
                }`}
              >
                <span>🎵</span>
                音楽 ({musicCount})
              </button>

              <button
                onClick={() => setFilterMode('illustration')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  filterMode === 'illustration' 
                    ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]' 
                    : 'text-gray-500 hover:text-fuchsia-400/50'
                }`}
              >
                <span>🖼️</span>
                イラスト ({illustrationCount})
              </button>
            </>
          )}
          
          <button
            onClick={() => setFilterMode('interested')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              filterMode === 'interested' 
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                : 'text-gray-500 hover:text-amber-500/50'
            }`}
          >
            <span>⭐</span>
            気になる ({interested.length})
          </button>

          <button
            onClick={() => setFilterMode('favorites')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              filterMode === 'favorites' 
                ? 'bg-[var(--color-cyan-500)] text-black shadow-[0_0_15px_var(--color-glow)]' 
                : 'text-gray-500 hover:text-[var(--color-cyan-400)]/50'
            }`}
          >
            <span>💖</span>
            推し候補 ({favorites.length})
          </button>

          <button
            onClick={() => setFilterMode('unregistered')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              filterMode === 'unregistered' 
                ? 'bg-[var(--color-cyan-500)]/20 text-[var(--color-cyan-400)] border border-[var(--color-cyan-400)]/40 shadow-[0_0_20px_var(--color-glow)]' 
                : 'text-gray-500 hover:text-[var(--color-cyan-400)]/50'
            }`}
          >
            <span>🎨</span>
            ファンアート募集中 ({unregisteredCount})
          </button>
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
              {filterMode === 'interested' ? '⭐' : filterMode === 'favorites' ? '💖' : filterMode === 'music' ? '🎵' : filterMode === 'illustration' ? '🖼️' : '🎨'}
            </span>
            <p className="text-gray-600 font-bold tracking-[0.2em] uppercase text-sm">
              {filterMode === 'interested' 
                ? '気になる曲はまだありません' 
                : filterMode === 'favorites' 
                  ? '推し候補はまだありません' 
                  : filterMode === 'music'
                    ? '音楽作品はまだありません'
                    : filterMode === 'illustration'
                      ? 'イラスト作品はまだありません'
                      : 'すべての楽曲にファンアートが登録されました！'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
