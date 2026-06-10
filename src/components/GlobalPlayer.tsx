'use client';

import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { usePathname } from 'next/navigation';

export default function GlobalPlayer() {
  const { currentTrack, closePlayer } = usePlayer();
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = React.useState(true);

  const prevPathnameRef = React.useRef(pathname);

  // ページを移動したらプレイヤーを閉じる（リセット）
  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      closePlayer();
      setIsPlaying(true);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, closePlayer]);

  if (!currentTrack) return null;

  // 表示するページを限定する
  const isArchivePage = pathname.endsWith('/tracks');
  const isSelectionPage = pathname.includes('/selection');
  if (!isArchivePage && !isSelectionPage) return null;

  return (
    <div className="fixed bottom-24 right-4 md:right-8 z-[100] w-[300px] md:w-[360px] animate-in slide-in-from-right-full duration-500">
      <div className="relative bg-surface border-2 border-[var(--color-cyan-400)]/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="bg-surface/80 px-4 py-2 flex items-center justify-between border-b border-surface-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-2 h-2 ${isPlaying ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-gray-600'} rounded-full`}></div>
            <span className="text-[10px] font-black tracking-widest text-foreground/60 uppercase truncate">
              {isPlaying ? 'Now Playing' : 'Paused'}
            </span>
          </div>
          <button 
            onClick={closePlayer}
            className="text-gray-500 hover:text-foreground p-1 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Player Content */}
        <div className="p-1 bg-background relative">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-surface shadow-inner flex items-center justify-center">
            {isPlaying ? (
              currentTrack.platform === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentTrack.mediaId}?autoplay=1&rel=0&modestbranding=1`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe
                  src={`https://embed.nicovideo.jp/watch/${currentTrack.mediaId}?jsapi=1&autoplay=1`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              )
            ) : (
              <div className="text-center space-y-4">
                {currentTrack.platform === 'youtube' ? (
                  <img 
                    src={`https://img.youtube.com/vi/${currentTrack.mediaId}/mqdefault.jpg`} 
                    alt="thumbnail" 
                    onError={(e) => {
                      if (e.currentTarget.src.includes('mqdefault.jpg')) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${currentTrack.mediaId}/default.jpg`;
                      }
                    }}
                    onLoad={(e) => {
                      if (e.currentTarget.naturalWidth <= 120 && e.currentTarget.src.includes('mqdefault.jpg')) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${currentTrack.mediaId}/default.jpg`;
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-surface-border opacity-20 blur-sm"></div>
                )}
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="relative z-10 w-16 h-16 rounded-full bg-[var(--color-cyan-500)]/20 border border-[var(--color-cyan-400)]/50 flex items-center justify-center text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)] hover:text-black transition-all hover:scale-110 shadow-[0_0_20px_var(--color-glow)]"
                >
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer with Control */}
        <div className="px-4 py-3 bg-surface/50 flex items-center justify-between gap-4 border-t border-surface-border">
          <div className="overflow-hidden flex-grow">
            <h4 className="text-[11px] font-black text-foreground truncate uppercase tracking-widest leading-none mb-1">
              {currentTrack.title}
            </h4>
            <p className="text-[9px] text-[var(--color-cyan-400)]/60 font-mono tracking-[0.2em] uppercase leading-none">
              High-Fidelity Audio
            </p>
          </div>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-[var(--color-cyan-500)]/20 hover:border-[var(--color-cyan-400)]/50 flex items-center justify-center text-white transition-all group"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-foreground/60 group-hover:text-[var(--color-cyan-400)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5 text-[var(--color-cyan-400)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Decorative Blur Background */}
      <div className="absolute -inset-4 bg-[var(--color-cyan-500)]/10 blur-2xl -z-10 rounded-full pointer-events-none"></div>
    </div>
  );
}
