
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AwardResult from '../_components/AwardResult';

import { notFound } from "next/navigation";

export default async function AwardsPreviewPage({ params }: { params: Promise<{ eventSlug: string }> }) {
  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) notFound();
  // 公開・非公開に関わらず全てのアワードを取得
  const awards = await prisma.award.findMany({
    orderBy: { order: 'asc' }
  });

  // UserPlaylistを取得して渡す
  const playlists = await prisma.userPlaylist.findMany({
    select: { id: true, userName: true }
  });

  return (
    <main className="min-h-screen bg-background text-white selection:bg-yellow-500/30 overflow-x-hidden flex flex-col items-center relative">
      
      {/* Back Button */}
      <div className="absolute left-6 top-8 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 hover:text-yellow-500 transition-colors uppercase group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* ヒーローセクション */}
      <section className="w-full pt-16 pb-8 flex flex-col items-center text-center relative overflow-visible">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent -z-10" />
        
        <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">
          Music Festival Finale
        </div>
        
        <div className="relative overflow-visible">
          <h1 className="inline-block text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[1.1] py-8 px-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            AWARDS 2026
          </h1>
        </div>
        
        <p className="text-lg md:text-2xl font-medium text-neutral-400 tracking-[0.2em] mt-4">
          栄光の瞬間まで、あと少し。
        </p>
      </section>

      {/* メインコンテンツ */}
      <AwardResult awards={awards} isPreview={false} playlists={playlists} />

      <footer className="w-full py-12 text-center border-t border-white/5 text-neutral-600">
        <p className="text-xs font-mono tracking-[0.3em] uppercase">
          AWARDS 2026 • THE FUTURE OF MUSIC
        </p>
        <p className="text-[10px] mt-2 tracking-widest">
          PENGUIN-HOODIE PROTECTOR OVERSEES FINAL VERIFICATION.
        </p>
      </footer>
    </main>
  );
}
