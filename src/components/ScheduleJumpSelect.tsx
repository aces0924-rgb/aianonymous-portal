'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';

interface Track {
  id: number;
  entryNo: string | null;
  title: string;
}

export default function ScheduleJumpSelect({ tracks }: { tracks: Track[] }) {
  const router = useRouter();
  const { interested } = useFavorites();

  if (tracks.length === 0) return null;

  // このセッションに1曲でも「気になる」曲があるか
  const hasInterested = tracks.some(t => interested.includes(t.id));

  return (
    <div className="relative group mt-4">
      <div className={`flex items-center bg-white/5 border rounded-xl overflow-hidden transition-all duration-300 focus-within:bg-white/10 ${
        hasInterested ? 'border-yellow-500/40' : 'border-white/10'
      } focus-within:border-[var(--color-cyan-400)]/50`}>
        <div className={`pl-4 pr-2 text-[10px] font-black tracking-tighter border-r border-white/5 shrink-0 uppercase select-none ${
          hasInterested ? 'text-yellow-500' : 'text-[var(--color-cyan-400)]'
        }`}>
          Jump to
        </div>
        <div className="relative flex-1">
          <select
            onChange={(e) => {
              if (e.target.value) {
                router.push(`/tracks/${e.target.value}?preview=honban`);
              }
            }}
            className={`appearance-none bg-transparent font-bold text-xs py-3 px-4 pr-10 outline-none cursor-pointer w-full ${
              hasInterested ? 'text-yellow-400' : 'text-white'
            }`}
            defaultValue=""
          >
            <option value="" disabled className="bg-surface text-foreground/40">
              楽曲を選択...
            </option>
            {tracks.map((track) => {
              const isInterested = interested.includes(track.id);
              return (
                <option 
                  key={track.id} 
                  value={track.id} 
                  className={`bg-surface ${isInterested ? 'text-yellow-400 font-black' : 'text-foreground'}`}
                >
                  {isInterested ? '★ ' : ''}No.{track.entryNo} : {track.title}
                </option>
              );
            })}
          </select>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            hasInterested ? 'text-yellow-500/50 group-hover:text-yellow-400' : 'text-foreground/30 group-hover:text-[var(--color-cyan-400)]'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
