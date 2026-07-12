'use client';

import { useRouter } from 'next/navigation';

interface TrackInfo {
  id: number | string;
  entryNo: string | null;
  title: string;
  artistName?: string | null;
}

export default function TrackJumpSelect({ 
  tracks, 
  preview,
  eventSlug = 'teihenanofes',
  isArtistMain = false
}: { 
  tracks: TrackInfo[], 
  preview?: string,
  eventSlug?: string,
  isArtistMain?: boolean
}) {
  const router = useRouter();

  const handleJump = (id: string) => {
    if (!id) return;
    const query = preview === 'honban' ? '?preview=honban' : '';
    router.push(`/${eventSlug}/tracks/${id}${query}`);
  };

  return (
    <div className="relative group w-full">
      <div className="flex items-center bg-zinc-900/90 border border-white/25 rounded-lg overflow-hidden transition-all duration-300 focus-within:border-white/60 focus-within:shadow-lg w-full">
        <span className="pl-4 pr-2 text-zinc-300 font-mono text-xs font-black tracking-widest select-none shrink-0 border-r border-white/20">
          JUMP
        </span>
        <div className="relative flex-1 min-w-0">
          <select
            onChange={(e) => handleJump(e.target.value)}
            className="appearance-none bg-transparent text-white font-mono text-sm md:text-base py-2.5 px-4 pr-12 outline-none cursor-pointer w-full whitespace-nowrap overflow-hidden text-ellipsis"
            defaultValue=""
          >
            <option value="" disabled className="bg-zinc-900 text-white">
              {isArtistMain ? 'アーティストを選択 ...' : '楽曲を選択 ...'}
            </option>
            {tracks.map((track) => {
              const mainText = isArtistMain && track.artistName ? track.artistName : track.title;
              return (
                <option 
                  key={track.id} 
                  value={track.id} 
                  className="bg-zinc-900 text-white py-2"
                >
                  No.{track.entryNo || track.id.toString().padStart(3, '0')} : {mainText}
                </option>
              );
            })}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground group-hover:text-cyan-400 group-focus-within:text-cyan-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
