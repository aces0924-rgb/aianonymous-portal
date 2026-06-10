'use client';

import { usePlayer } from '@/context/PlayerContext';

interface TrackDetailHeaderProps {
  id: number;
  title: string;
  songUrl?: string;
  audioUrl?: string;
}

export default function TrackDetailHeader({ id, title, songUrl, audioUrl }: TrackDetailHeaderProps) {
  const { playTrack } = usePlayer();

  return (
    <div className="flex items-center gap-4 mb-8 group">
      {(songUrl || audioUrl) && (
        <button
          onClick={() => playTrack(id, title, songUrl || '', audioUrl || '')}
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--color-cyan-500)]/10 border-2 border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)] hover:text-black transition-all active:scale-95 shrink-0 shadow-[0_0_20px_var(--color-glow)] hover:border-[var(--color-cyan-400)]"
          title="再生する"
        >
          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tighter group-hover:text-[var(--color-cyan-400)] transition-colors">
        {title}
      </h1>
    </div>
  );
}
