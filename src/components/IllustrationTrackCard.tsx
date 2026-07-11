'use client';

import Link from 'next/link';
import { getDirectStreamUrl } from '@/lib/audio';

import InterestedButton from './InterestedButton';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from '@/context/FavoritesContext';
import AudioPlayer from './AudioPlayer';

export default function IllustrationTrackCard({ track, preview, enableArtistMain, eventSlug }: { track: any, preview?: string, enableArtistMain?: boolean, eventSlug: string }) {
  const audioSource = getDirectStreamUrl(track.audioUrl || track.songUrl);
  const isPlayable = !!audioSource;
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(track.id);

  // プレビューモード（手動パラメータ指定）中のみクエリを引き継ぐ
  const detailUrl = preview === 'honban' 
    ? `/${eventSlug}/tracks/${track.id}?preview=honban` 
    : `/${eventSlug}/tracks/${track.id}`;

  return (
    <div className={`bg-surface/40 border ${favorite ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-purple-900/50'} rounded-2xl p-4 md:p-5 hover:border-purple-400 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden group backdrop-blur-sm`}>
      {/* Accent border */}
      <div className={`absolute top-0 left-0 w-1 h-full ${favorite ? 'bg-purple-400' : 'bg-gray-800'} group-hover:bg-purple-400 transition-all duration-500`}></div>
      
      <div className="flex flex-col gap-3">
        {/* Header: No. Genre and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/50 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-mono text-base md:text-lg font-black tracking-widest bg-purple-950/40 px-2 py-1 rounded-md border border-purple-800/50 whitespace-nowrap">
              No.{track.entryNo || track.id.toString().padStart(3, '0')}
            </span>
            {enableArtistMain && track.title ? (
              <span className="text-foreground font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest  truncate max-w-[100px] md:max-w-[150px]">
                {track.title}
              </span>
            ) : track.genre && (
              <span className="text-foreground font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest  truncate max-w-[100px] md:max-w-[150px]">
                {track.genre}
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
              <span>詳細画面へ</span>
              <span className="group-hover/link:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
        
        {/* Title and Play Button */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2 max-w-full">
            <h3 className="text-xl md:text-2xl font-black text-foreground group-hover:text-purple-300 transition-colors leading-tight tracking-tight">
              {enableArtistMain && track.artistName ? track.artistName : track.title}
            </h3>
            {enableArtistMain && track.artistName && track.xAccount && (
              <a 
                href={track.xAccount.startsWith('http') ? track.xAccount : `https://x.com/${track.xAccount.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-purple-400 transition-colors shrink-0 flex items-center justify-center p-1"
                title="X (Twitter) プロフィール"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>

          <div className="w-full">
            <AudioPlayer audioSource={audioSource} trackId={track.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
