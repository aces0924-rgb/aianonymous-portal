'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LiveBroadcastClient({ liveEvent }: { liveEvent: any }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const dayLabel = liveEvent.day === 0 ? 'Eve' : liveEvent.day === 16 ? 'Final' : `Day ${String(liveEvent.day).padStart(2, '0')}`;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[110] animate-in slide-in-from-bottom duration-500">
        <div className="relative group w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-[0_-5px_25px_rgba(220,38,38,0.4)]">
          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-background/20 rounded-full text-foreground hover:bg-background/40 transition-colors"
            title="閉じる"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <Link 
            href={liveEvent.youtubeUrl || "/schedule"}
            target={liveEvent.youtubeUrl ? "_blank" : "_self"}
            className="block w-full py-2.5 md:py-3 text-center relative overflow-hidden px-10"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />
            
            <div className="relative flex items-center justify-center gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 bg-background/30 px-2 py-0.5 rounded-full border border-white/20 shadow-sm shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-[10px] md:text-xs font-black tracking-tighter text-foreground uppercase">Live</span>
              </div>
              
              <p className="text-[10px] md:text-xs font-black tracking-[0.1em] md:tracking-[0.2em] text-foreground uppercase drop-shadow-md whitespace-nowrap">
                YouTube プレミア公開中：<span className="text-yellow-200">{dayLabel}</span> 放送中！ 
              </p>
              
              <span className="hidden sm:inline-block text-[9px] md:text-xs font-bold px-3 py-0.5 bg-white/10 rounded-full border border-white/10 text-foreground">
                番組を見る →
              </span>
            </div>
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        body { padding-bottom: 48px !important; }
        @media (min-width: 768px) { body { padding-bottom: 56px !important; } }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </>
  );
}
