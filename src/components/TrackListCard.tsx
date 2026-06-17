'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFavorites } from '@/context/FavoritesContext';
import { usePlayer } from '@/context/PlayerContext';
import { parseXAccountUrl } from '@/lib/id-utils';

export default function TrackListCard({ track, preview, enableArtistMain, eventSlug }: { track: any, preview?: string, enableArtistMain?: boolean, eventSlug: string }) {
  const { isFavorite, toggleFavorite, isInterested, toggleInterested } = useFavorites();
  const { playTrack } = usePlayer();
  const favorite = isFavorite(track.id);
  const interested = isInterested(track.id);

  // プレビューモード（手動パラメータ指定）中のみクエリを引き継ぐ
  const detailUrl = preview === 'honban' 
    ? `/${eventSlug}/tracks/${track.id}?preview=honban` 
    : `/${eventSlug}/tracks/${track.id}`;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // YouTube URLからビデオIDを抽出
  const getYoutubeVideoId = (url: string | null | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYoutubeVideoId(track.audioUrl || track.songUrl);
  // 基本的な高画質サムネイル（maxresdefaultが存在しない場合のフォールバック用）
  const fallbackThumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  const isIllustration = (url?: string | null) => {
    if (!url) return false;
    const isVideo = url.match(/(?:youtu\.be\/|youtube\.com\/|nicovideo\.jp\/|nico\.ms\/|suno\.com\/)/);
    if (isVideo) return false;
    return !!(url.match(/\.(jpeg|jpg|gif|png)$/i) || url.includes('pbs.twimg.com') || url.includes('gyazo.com'));
  };
  const isImg = isIllustration(track.songUrl);

  const isSunoUrl = (url?: string | null) => url ? url.includes('suno.com') : false;
  const isSuno = isSunoUrl(track.songUrl) || isSunoUrl(track.audioUrl);

  const extractSunoId = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/suno\.com\/(?:song|embed|s)\/([a-zA-Z0-9\-]+)/);
    return match ? match[1] : null;
  };
  const sunoId = extractSunoId(track.songUrl) || extractSunoId(track.audioUrl);

  const isArtistMain = enableArtistMain && !!track.artistName;
  const mainText = isArtistMain ? track.artistName : track.title;
  const subText = isArtistMain ? track.title : track.artistName;

  return (
    <div className={`bg-surface/80 border ${favorite ? 'border-[var(--color-cyan-400)]' : 'border-surface-border'} rounded-xl p-4 hover:border-[var(--color-cyan-400)] transition-all group backdrop-blur-sm relative overflow-hidden`}>
      <div className="flex flex-col justify-between gap-4">
        <Link href={detailUrl} className="flex flex-col min-w-0 flex-1 group/link mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[var(--color-cyan-500)] font-mono text-sm font-bold bg-[var(--color-cyan-500)]/10 px-2 py-0.5 rounded border border-[var(--color-cyan-500)]/30">
              No.{track.entryNo || track.id.toString().padStart(3, '0')}
            </span>
            {track.genre && (
              <span className="text-foreground font-mono text-xs uppercase tracking-wider whitespace-nowrap">
                {track.genre}
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover/link:text-[var(--color-cyan-400)] transition-colors break-words leading-tight mt-1 flex items-center flex-wrap gap-2">
            <span>{mainText}</span>
            {isArtistMain && track.xAccount && parseXAccountUrl(track.xAccount) && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(parseXAccountUrl(track.xAccount)!, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-black hover:bg-zinc-800 group/xbtn border border-white/20 transition-all shadow-md hover:scale-110 active:scale-95"
                title="X (Twitter) アカウントを見る"
              >
                <svg className="w-3 h-3 text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
            )}
          </h3>
          {subText && (
            <p className="text-sm text-foreground mt-1.5 font-medium flex items-center gap-1.5">
              {!isArtistMain && (
                <svg className="w-3.5 h-3.5 " viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
              {subText}
            </p>
          )}
        </Link>

        {sunoId && (
          <div className="w-full mb-1">
            <iframe
              src={`https://suno.com/embed/${sunoId}`}
              width="100%"
              height="120"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="rounded-xl border border-surface-border/50 bg-black/20"
            ></iframe>
          </div>
        )}

        {isImg && track.songUrl && (
          <button 
            className="w-full mb-1 relative h-[120px] rounded-xl overflow-hidden border border-surface-border/50 bg-black/20 group/imgbtn block shrink-0"
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
          >
            <Image
              src={track.songUrl}
              alt={track.title || "Illustration"}
              fill
              className="object-cover opacity-80 group-hover/imgbtn:opacity-100 group-hover/imgbtn:scale-105 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/imgbtn:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                拡大表示
              </span>
            </div>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isImg ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white transition-all active:scale-90"
              title="イラストを見る"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
          ) : (
            !isSuno && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  playTrack(track.id, track.title, track.songUrl, track.audioUrl);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all active:scale-90"
                title="再生する"
              >
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )
          )}

          {/* Thumbnail Button */}
          {videoId && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full border transition-all active:scale-90 bg-transparent border-gray-800 text-foreground hover:border-cyan-500/50 hover:text-cyan-500"
              title="サムネイルを拡大"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          )}

          {/* Interested Button (Star) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleInterested(track.id);
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all active:scale-90 ${
              interested 
                ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                : 'bg-transparent border-gray-800 text-foreground hover:border-amber-500/50 hover:text-amber-500'
            }`}
            title="気になる"
          >
            <svg className="w-5 h-5" fill={interested ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>

          {/* Favorite Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(track.id);
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all active:scale-90 ${
              favorite 
                ? 'bg-pink-500/20 border-pink-500 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                : 'bg-transparent border-surface-border text-foreground hover:border-pink-500/50 hover:text-pink-500'
            }`}
            title={enableArtistMain ? "推し人に選ぶ" : "推し曲に選ぶ"}
          >
            <svg className="w-5 h-5" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <Link 
            href={detailUrl} 
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 border border-purple-500/40 text-foreground rounded-full hover:bg-purple-600 hover:text-white transition-all active:scale-90 text-xs font-black uppercase tracking-tighter shadow-lg shadow-purple-900/20"
            style={{ textShadow: 'none' }}
          >
            <span>詳細</span>
            <span className="text-sm">→</span>
          </Link>
        </div>
      </div>

      {/* サムネイル/イラスト拡大モーダル */}
      {isModalOpen && (videoId || isImg) && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(false);
          }}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors bg-white/10 w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsModalOpen(false);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={isImg ? track.songUrl : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
              alt={track.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.1)] border border-white/10"
              onError={(e) => {
                if (!isImg && fallbackThumbnailUrl) {
                  (e.target as HTMLImageElement).src = fallbackThumbnailUrl;
                }
              }}
              onLoad={(e) => {
                if (!isImg && e.currentTarget.naturalWidth <= 120 && fallbackThumbnailUrl) {
                  (e.target as HTMLImageElement).src = fallbackThumbnailUrl;
                }
              }}
              onClick={(e) => e.stopPropagation()} // 画像クリック時は閉じない
            />
            <p className="mt-4 text-white font-bold text-lg bg-black/50 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
              {track.title}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
