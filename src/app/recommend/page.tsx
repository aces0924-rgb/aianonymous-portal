import prisma from '@/lib/prisma';
import TrackCard from '@/components/TrackCard';
import Link from 'next/link';
import Image from 'next/image';
import ShareButton from '@/components/ShareButton';
import { getPlaylistByUserName } from './actions';

export default async function RecommendPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; ids?: string }>;
}) {
  const { u: userName, ids: urlIds } = await searchParams;

  if (!userName) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center space-y-8">
        <h1 className="text-4xl font-black text-red-500">INVALID LINK</h1>
        <p className="text-foreground">ユーザー名が指定されていません。</p>
        <Link href="/" className="px-8 py-4 bg-surface border border-surface-border rounded-full hover:border-[var(--color-cyan-400)] transition-all">
          トップに戻る
        </Link>
      </main>
    );
  }

  // Fetch from DB
  const playlist = await getPlaylistByUserName("teihenanofes", userName);
  
  // Use DB ids if found, otherwise fallback to URL ids (for backward compatibility or new ones not yet in DB)
  const finalIds = playlist?.trackIds || urlIds;

  if (!finalIds) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center space-y-8">
        <h1 className="text-4xl font-black text-red-500">NOT FOUND</h1>
        <p className="text-foreground">「{userName}」さんのリストは見つかりませんでした。</p>
        <Link href="/" className="px-8 py-4 bg-surface border border-surface-border rounded-full hover:border-[var(--color-cyan-400)] transition-all">
          トップに戻る
        </Link>
      </main>
    );
  }

  const idArray = finalIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

  // Fetch tracks from DB
  const tracks = await (prisma as any).track.findMany({
    where: {
      id: { in: idArray },
      published: true
    }
  });

  // Keep original order
  const sortedTracks = idArray.map(id => tracks.find((t: any) => t.id === id)).filter(Boolean);

  return (
    <main className="min-h-screen bg-background text-white selection:bg-[var(--color-cyan-500)] selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Header */}
      <section className="relative py-24 md:py-32 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cyan-400)]/20 via-black to-black z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-cyan-500)]/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-surface/50 border border-surface-border hover:border-[var(--color-cyan-400)] transition-all mb-8 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-sm font-black tracking-widest uppercase">Back to Top</span>
          </Link>
          
          <div className="space-y-2">
            <span className="inline-block px-4 py-1 rounded-full bg-[var(--color-cyan-500)] text-black text-[10px] font-black tracking-[0.4em] uppercase mb-4 shadow-[0_0_20px_var(--color-glow)]">
              Curated Playlist
            </span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight italic">
              <span className="text-[var(--color-cyan-400)] drop-shadow-[0_0_15px_var(--color-glow)]">{userName}</span> 様の<br />
              推薦作品リスト
            </h1>
          </div>
          
          <div className="pt-10 flex flex-col items-center gap-6">
             {playlist?.appeal && (
               <div className="relative max-w-2xl mx-auto">
                 <div className="absolute -top-3 -left-3 text-4xl text-[var(--color-cyan-400)] ">"</div>
                 <div className="absolute -bottom-3 -right-3 text-4xl text-[var(--color-cyan-400)]  rotate-180">"</div>
                 <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed italic px-6">
                   {playlist.appeal}
                 </p>
               </div>
             )}
             <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--color-cyan-400)] to-transparent mt-4"></div>
          </div>
        </div>
      </section>

      {/* Tracks Container */}
      <section className="max-w-4xl mx-auto px-6 pb-40 space-y-12">
        <div className="bg-surface/30 border border-surface-border rounded-[3rem] p-10 md:p-16 shadow-2xl backdrop-blur-sm text-center">
          
          {/* Share Section (Top) */}
          <div className="mb-16 pb-12 border-b border-surface-border/50">
            <ShareButton userName={userName} />
          </div>

          <div className="grid grid-cols-1 gap-12 text-left">
            {sortedTracks.map((t: any, idx: number) => (
              <div key={t.id} className="relative">
                <div className="absolute -left-4 -top-4 w-12 h-12 flex items-center justify-center bg-surface border-2 border-[var(--color-cyan-400)] text-[var(--color-cyan-400)] font-black rounded-full z-20 text-xl italic shadow-lg">
                  {idx + 1}
                </div>
                <TrackCard track={t} eventSlug={t.event?.slug || t.eventSlug || 'aicomfes'} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="text-center pt-12 space-y-6">
          <p className="text-foreground font-light italic text-sm">
            このリストは {userName} さんによって作成されました。<br />あなたも推し10曲を見つけて共有しませんか？
          </p>
          <Link 
            href="/#tracks" 
            className="inline-block px-12 py-5 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-black transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            自分もリストを作る
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-border bg-background py-24 text-center text-foreground mt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            width={128}
            height={50}
            className="w-32 mx-auto opacity-30 grayscale" 
            style={{ mixBlendMode: 'screen' }}
          />
          <p className="text-xs tracking-[0.4em] font-light uppercase">© 2026 AI-ANONYMOUS MUSIC FES.</p>
        </div>
      </footer>
    </main>
  );
}
