'use client';

import Link from 'next/link';
import { getDirectStreamUrl } from '@/lib/audio';

import InterestedButton from './InterestedButton';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from '@/context/FavoritesContext';
import { usePlayer } from '@/context/PlayerContext';

export default function TrackCard({ track, preview }: { track: any, preview?: string }) {
  const audioSource = getDirectStreamUrl(track.audioUrl || track.songUrl);
  const isPlayable = !!audioSource;
  const { isFavorite } = useFavorites();
  const { playTrack } = usePlayer();
  const favorite = isFavorite(track.id);

  // プレビューモード（手動パラメータ指定）中のみクエリを引き継ぐ
  const detailUrl = preview === 'honban' 
    ? `/tracks/${track.id}?preview=honban` 
    : `/tracks/${track.id}`;

  return (
    <div className={`bg-surface/40 border ${favorite ? 'border-[var(--color-cyan-400)] shadow-[0_0_20px_var(--color-glow)]' : 'border-[var(--color-cyan-400)]/50'} rounded-2xl p-4 md:p-5 hover:border-[var(--color-cyan-400)] transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden group backdrop-blur-sm`}>
      {/* Accent border */}
      <div className={`absolute top-0 left-0 w-1 h-full ${favorite ? 'bg-[var(--color-cyan-500)]' : 'bg-gray-800'} group-hover:bg-[var(--color-cyan-500)] transition-all duration-500`}></div>
      
      <div className="flex flex-col gap-3">
        {/* Header: No. Genre and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/50 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-[var(--color-cyan-400)] font-mono text-base md:text-lg font-black tracking-widest bg-[var(--color-cyan-500)]/40 px-2 py-1 rounded-md border border-[var(--color-cyan-400)]/50 whitespace-nowrap">
              No.{track.entryNo || track.id.toString().padStart(3, '0')}
            </span>
            {track.genre && (
              <span className="text-foreground/60 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 truncate max-w-[100px] md:max-w-[150px]">
                {track.genre}
              </span>
            )}
            {!track.published && (
              <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-bold">
                非公開
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <InterestedButton trackId={track.id} compact={true} />
            <FavoriteButton trackId={track.id} compact={true} />
            
            <Link 
              href={detailUrl} 
              className="ml-1 flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/40 text-purple-200 rounded-full text-[10px] md:text-xs font-black hover:bg-purple-600 hover:text-white hover:border-purple-300 transition-all group/link whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.1)]"
            >
              <span>歌詞・AI考察へ</span>
              <span className="group-hover/link:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
        
        {/* Title and Play Button */}
        <div className="flex items-center gap-4">
          {(track.songUrl || track.audioUrl) ? (
            <button
              onClick={() => playTrack(track.id, track.title, track.songUrl, track.audioUrl)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-cyan-500)]/10 border border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)] hover:text-black transition-all active:scale-90 shrink-0 shadow-[0_0_15px_var(--color-glow)] group-hover:border-[var(--color-cyan-400)]"
              title="再生する"
            >
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-500/5 border border-red-500/20 flex items-center justify-center text-red-500/40 shrink-0" title="楽曲データなし">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18.36 18.36l-1.41-1.41M6.34 6.34l-1.41-1.41M2 12h2M20 12h2M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <h3 className="text-xl md:text-2xl font-black text-foreground group-hover:text-[var(--color-cyan-400)] transition-colors leading-tight truncate tracking-tight">
            {track.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
