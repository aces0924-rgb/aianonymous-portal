'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AudioPlayerProps {
  audioSource: string | null;
  trackId: number;
  isPreviewMode?: boolean;
}

import { getNiconicoThumbnail } from '@/app/actions/niconico';

function getYouTubeID(url: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getNiconicoID(url: string | null): string | null {
  if (!url) return null;
  const regExp = /(?:nicovideo\.jp\/watch\/|nico\.ms\/)(sm\d+|nm\d+|so\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function AudioPlayer({ audioSource, trackId, isPreviewMode }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const youtubeId = useMemo(() => getYouTubeID(audioSource), [audioSource]);
  const niconicoId = useMemo(() => getNiconicoID(audioSource), [audioSource]);
  const isImage = useMemo(() => {
    if (!audioSource) return false;
    return !!audioSource.match(/\.(jpeg|jpg|gif|png|webp|bmp)(\?.*)?$/i) || audioSource.includes('pbs.twimg.com') || audioSource.includes('gyazo.com');
  }, [audioSource]);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isImage && audioSource) {
      setImgSrc(audioSource);
    } else if (youtubeId) {
      setImgSrc(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
    } else if (niconicoId) {
      getNiconicoThumbnail(niconicoId).then(url => {
        if (url) setImgSrc(url);
      });
    }
  }, [youtubeId, niconicoId, isImage, audioSource]);

  const handleImageError = () => {
    if (imgSrc?.includes('maxresdefault.jpg')) {
      setImgSrc(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
    } else if (imgSrc?.includes('hqdefault.jpg')) {
      setImgSrc(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (e.currentTarget.naturalWidth <= 120) {
      handleImageError();
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!youtubeId && !niconicoId && !isImage) {
    return (
      <div className="flex flex-col gap-4 bg-red-50 dark:bg-red-950/30 p-8 rounded-3xl border border-red-200 dark:border-red-900/50 w-full backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 justify-center mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></span>
          <span className="text-red-600 dark:text-red-400 font-mono text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
            Notice for Contributor
          </span>
        </div>
        {isPreviewMode ? (
          <p className="text-red-800 dark:text-red-200 font-bold text-center text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            投稿者様へ。<br />
            匿名フェス用応募の場合、動画は運営にて投稿されるまでお待ちください。
          </p>
        ) : (
          <p className="text-red-800 dark:text-red-200 font-bold text-center text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            投稿者様へ。<br />
            対応する動画URL（YouTube または ニコニコ動画）が設定されていません。<br />
            DMまたはメールにて投稿内容の不備を連絡しておりますので、ご確認ください。
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 bg-background/40 p-4 rounded-xl border border-white/5 w-full backdrop-blur-sm shadow-inner group/player relative">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-[var(--color-cyan-400)] font-mono tracking-widest uppercase flex items-center gap-2">
            {!isImage && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            {isImage ? 'Illustration Artwork' : (niconicoId ? 'Niconico Platform' : 'YouTube Platform')}
          </span>
        </div>
        
        <div className={`w-full relative rounded-lg overflow-hidden border border-surface-border bg-background shadow-2xl ${isImage ? '' : 'group/video'}`} style={{ aspectRatio: isImage ? 'auto' : '16/9' }}>
          {isImage ? (
            <div className="w-full flex justify-center items-center bg-black/40 min-h-[300px] max-h-[80vh] cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}>
              <img src={imgSrc || undefined} alt="Illustration" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl animate-in fade-in duration-700" />
            </div>
          ) : !isPlaying ? (
            <>
              <button 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 w-full h-full flex items-center justify-center group/btn"
              >
                {(youtubeId || (niconicoId && imgSrc)) ? (
                  <img 
                    src={imgSrc || undefined} 
                    alt="Video Thumbnail" 
                    className="absolute inset-0 w-full h-full object-cover  group-hover/video:opacity-100 transition-opacity duration-700"
                    loading="lazy"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-surface-border opacity-20 flex items-center justify-center">
                    {!imgSrc && niconicoId && <span className="w-6 h-6 border-2 border-white/20 border-t-[var(--color-cyan-400)] rounded-full animate-spin"></span>}
                  </div>
                )}
                {/* Completely clean overlay - only hover tint */}
                <div className="absolute inset-0 bg-background/0 group-hover/video:bg-background/10 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-500">
                    <svg className="w-6 h-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Lightbox / Maximize Button (Stops propagation to avoid autoplay) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-xl bg-background/70 hover:bg-[var(--color-cyan-500)] hover:text-black text-white border border-white/10 flex items-center justify-center font-bold shadow-2xl transition-all hover:scale-110 active:scale-95 group/maxbtn"
                title="サムネイルを拡大表示"
              >
                <span className="text-2xl transition-transform duration-300 group-hover/maxbtn:scale-110 leading-none">
                  ⤢
                </span>
              </button>
            </>
          ) : (
            youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title="YouTube video player"
                className="absolute top-0 left-0 w-full h-full border-0 animate-in fade-in duration-700"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <iframe
                src={`https://embed.nicovideo.jp/watch/${niconicoId}`}
                title="Niconico video player"
                className="absolute top-0 left-0 w-full h-full border-0 animate-in fade-in duration-700"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            )
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center px-1">
          <p className="text-[10px] md:text-xs font-bold tracking-widest text-[var(--color-cyan-400)] uppercase">
            {isImage ? 'Artwork View' : (isPlaying ? 'Now Playing' : 'Ready to Play')}
          </p>
          <p className="text-[10px] md:text-xs text-foreground font-medium italic">
            {isImage 
              ? '※画像をタップ or クリックすると拡大表示されます'
              : (isPlaying 
                ? '※プレイヤーにて再生中' 
                : '※上の画面をタップ or クリックすると再生されます')}
          </p>
        </div>
      </div>

      {/* Lightbox Modal (Zero Storage Cost / Super Large Static Image Overlay) */}
      {isLightboxOpen && mounted && createPortal(
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 cursor-zoom-out animate-in fade-in duration-300"
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-[var(--color-cyan-500)] hover:text-black text-white text-2xl font-black border border-white/10 flex items-center justify-center transition-all shadow-2xl hover:scale-110 z-50"
            title="拡大表示を閉じる"
          >
            ×
          </button>
          
          {/* Super Large Image Container (Dynamically expands to the limits of the browser window) */}
          <div className="relative w-full max-w-[95vw] max-h-[85vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
            <img 
              src={imgSrc || undefined} 
              alt="Super Expanded Static Thumbnail" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-[0_0_80px_var(--color-glow)] animate-in zoom-in duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
          
          <p className="mt-6 text-neutral-400 text-xs md:text-sm font-black tracking-[0.3em] uppercase opacity-75">
            Tap / Click anywhere to close
          </p>
        </div>,
        document.body
      )}
    </>
  );
}
