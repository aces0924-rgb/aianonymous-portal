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
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(24);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
    setVisibleCount(24); // フィルタを変更したら表示件数をリセット
  };

  const toggleGenre = (genre: string) => {
    setActiveGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setVisibleCount(24); // フィルタを変更したら表示件数をリセット
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
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

  // 第1段階：メインフィルタ（種類と状態）による絞り込み
  const primaryFilteredTracks = useMemo(() => {
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

  // 表示可能なジャンルを抽出（メインフィルタ後から抽出）
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    primaryFilteredTracks.forEach(t => {
      if (t.genre) {
        genres.add(t.genre.trim());
      }
    });
    return Array.from(genres).sort();
  }, [primaryFilteredTracks]);

  // ジャンルフィルタエリアを表示するかどうか（音楽かイラストが選択されている場合）
  const showGenreFilter = activeFilters.includes('music') || activeFilters.includes('illustration');

  // 第2段階：ジャンルによる絞り込み
  const finalFilteredTracks = useMemo(() => {
    // ジャンルフィルタが表示されていない、またはジャンルが選択されていない場合はそのまま返す
    if (!showGenreFilter || activeGenres.length === 0) return primaryFilteredTracks;
    
    return primaryFilteredTracks.filter(t => t.genre && activeGenres.includes(t.genre.trim()));
  }, [primaryFilteredTracks, activeGenres, showGenreFilter]);

  return (
    <div className="space-y-8">
      {/* Filter UI */}
      <div className="flex flex-col items-center gap-4">
        {/* メインフィルターUI */}
        <div className="bg-surface/50 p-1.5 rounded-2xl border border-surface-border flex flex-wrap gap-2 backdrop-blur-sm justify-center">
          <button
            onClick={() => { setActiveFilters([]); setActiveGenres([]); }}
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

        {/* サブフィルターUI（ジャンル）: 音楽かイラストが選択された時のみ表示 */}
        {showGenreFilter && availableGenres.length > 0 && (
          <div className="w-full max-w-4xl bg-black/40 p-2 md:p-3 rounded-2xl border border-white/5 flex flex-wrap gap-2 justify-center items-center animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-xs font-black text-gray-400 mr-2 flex items-center gap-1">
              <span>🏷️</span>
              ジャンルで絞り込む:
            </span>
            {availableGenres.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeGenres.includes(genre)
                    ? 'bg-[var(--color-cyan-500)]/20 text-[var(--color-cyan-400)] border border-[var(--color-cyan-500)]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-gray-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start min-h-[400px]">
        {finalFilteredTracks.slice(0, visibleCount).map((track) => (
          <TrackListCard 
            key={track.id} 
            track={track} 
            preview={preview} 
            enableArtistMain={enableArtistMain} 
            eventSlug={eventSlug}
          />
        ))}
        
        {finalFilteredTracks.length === 0 && (
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

      {/* Load More Button */}
      {finalFilteredTracks.length > visibleCount && (
        <div className="flex justify-center mt-12 pb-8">
          <button
            onClick={handleLoadMore}
            className="group relative px-8 py-3 rounded-2xl bg-surface/50 border border-surface-border hover:bg-surface-hover hover:border-[var(--color-cyan-400)]/50 transition-all shadow-lg active:scale-95"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground group-hover:text-white transition-colors">さらに作品を見る</span>
              <span className="text-xs text-gray-400 font-mono">({visibleCount} / {finalFilteredTracks.length})</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-cyan-400)] transition-colors animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
