'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TrackInfo {
  id: number;
  entryNo: string | null;
  title: string;
  artistName?: string | null;
}

export default function TrackJumpModern({ 
  tracks, 
  preview,
  enableShowCreators = false,
  enableArtistMain = false
}: { 
  tracks: TrackInfo[], 
  preview?: string,
  enableShowCreators?: boolean,
  enableArtistMain?: boolean,
  eventSlug: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTracks = React.useMemo(() => {
    if (query === '') return tracks;
    
    // 全角数字のみを半角に変換
    const normalizedQuery = query.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });

    const q = normalizedQuery.toLowerCase().trim();
    const qClean = q.replace(/^no\.?/, '').trim();
    const qIsNumeric = /^\d+$/.test(qClean);
    const qNum = qIsNumeric ? parseInt(qClean, 10) : null;

    return tracks.filter((track) => {
      const eno = (track.entryNo || "").toLowerCase();
      const title = track.title.toLowerCase();
      const artist = (track.artistName || "").toLowerCase();
      
      // 1. 完全な文字列一致 (No.XXX も含む)
      const fullStr = `no.${eno} ${title} ${artist}`;
      if (fullStr.includes(q)) return true;

      // 2. 数値としての正規化一致 (0サプレス / 0パディング対応)
      if (qNum !== null) {
        const enoNum = parseInt(eno, 10);
        if (!isNaN(enoNum) && enoNum === qNum) return true;
      }

      return false;
    }).sort((a, b) => {
      // 数値が完全一致するものを最優先に表示
      if (qNum !== null) {
        const aNum = parseInt(a.entryNo || "", 10);
        const bNum = parseInt(b.entryNo || "", 10);
        if (aNum === qNum && bNum !== qNum) return -1;
        if (bNum === qNum && aNum !== qNum) return 1;
      }
      return 0;
    });
  }, [query, tracks]);

  const handleSelect = (id: number) => {
    const queryParam = preview === 'honban' ? '?preview=honban' : '';
    router.push(`/${eventSlug}/tracks/${id}${queryParam}`);
    setIsOpen(false);
    setQuery('');
  };

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredTracks.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && filteredTracks[selectedIndex]) {
        handleSelect(filteredTracks[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center bg-surface border border-surface-border rounded-lg overflow-hidden transition-all duration-300 focus-within:border-[var(--color-cyan-400)] focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        <span className="pl-4 pr-2 text-[var(--color-cyan-500)] font-mono text-[10px] font-black tracking-widest select-none shrink-0 border-r border-surface-border/50">
          JUMP
        </span>
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent text-foreground font-mono text-sm py-2.5 px-4 outline-none w-full placeholder:text-foreground"
          placeholder={enableShowCreators ? "作品名・番号・クリエイター名で検索..." : "作品名・番号で検索..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <div className="pr-4 text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl border border-surface-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] max-h-[400px] md:max-h-[650px] overflow-y-auto custom-scrollbar">
          {filteredTracks.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredTracks.map((track, index) => {
                const isArtistMain = enableArtistMain && !!track.artistName;
                const mainText = isArtistMain ? track.artistName : track.title;
                const subText = isArtistMain ? track.title : track.artistName;

                return (
                <button
                  key={track.id}
                  onClick={() => handleSelect(track.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-[var(--color-cyan-500)] text-black' : 'text-foreground hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <span className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                    index === selectedIndex ? 'border-black/20 bg-background/10' : 'border-surface-border bg-surface text-[var(--color-cyan-400)]'
                  }`}>
                    {track.entryNo}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate">{mainText}</span>
                    {(enableShowCreators || isArtistMain) && subText && (
                      <span className="text-[10px] text-foreground truncate flex items-center gap-1 mt-0.5">
                        {!isArtistMain && (
                          <svg className="w-3 h-3 " viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                        {subText}
                      </span>
                    )}
                  </div>
                </button>
              )})}
            </div>
          ) : (
            <div className="p-8 text-center text-foreground italic text-sm">
              一致する作品が見つかりません
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
