import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { encodeSelectionId } from '@/lib/id-utils';
import IllustrationSelectionListContainer from '@/components/IllustrationSelectionListContainer';

export const revalidate = 3600;

import { notFound } from 'next/navigation';
export default async function IllustrationSelectionsIndexPage({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ preview?: string }> }) {
  const resolvedParams = await params;
  const { eventSlug } = resolvedParams;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();
  const { preview } = await searchParams;
  const isPreview = preview === 'honban';
  const previewQuery = isPreview ? '?preview=honban' : '';
  const themeConfig = JSON.parse(event.themeConfig || '{}');
  const labelConfig = JSON.parse(event.labelConfig || '{}');
  const defaultTheme = {
    logoUrl: themeConfig.logoUrl || '/images/logo.png'
  };
  const defaultLabels = {
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
  };
  const featureFlags = JSON.parse(event.featureFlags || '{}');
  const enableArtistMain = featureFlags.enableArtistMain ?? false;

  // Fetch all illustration playlists, ordered by newest first
  const illustrationPlaylists = await prisma.userIllustrationPlaylist.findMany({ where: { eventId: event.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[var(--color-cyan-500)] selection:text-white font-sans overflow-x-hidden relative">
      {/* Back Button (Fixed/Absolute Top Left) */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-30">
        <Link href={`/${eventSlug}${previewQuery}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface/80 backdrop-blur-md border border-surface-border hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform text-lg">←</span>
          <span className="text-xs md:text-sm font-black tracking-widest uppercase">Back to Top</span>
        </Link>
      </div>

      {/* Header Section */}
      <section className="relative pt-16 pb-6 md:pt-20 md:pb-8 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-glow)]/10 to-transparent z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-glow)]/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic text-foreground">
            みんなの<span className="text-[var(--color-cyan-400)]">{enableArtistMain ? '推しクリエイターリスト' : '推しイラストリスト'}</span>
          </h1>
          <p className="text-2xl md:text-4xl font-black tracking-tight text-foreground drop-shadow-[0_0_20px_var(--color-glow)] leading-tight">
            リスナーが選んだ珠玉のセレクション。
          </p>
          <p className="text-foreground max-w-xl mx-auto text-xs md:text-sm font-bold tracking-widest uppercase ">
            それぞれの想いが詰まったアピールポイントをチェックしましょう。
          </p>
          
          <div className="pt-6 flex justify-center">
            <div className="inline-flex bg-surface/50 p-1.5 rounded-full border border-surface-border backdrop-blur-sm">
              <Link 
                href={`/${eventSlug}/selections${previewQuery}`}
                className="px-6 py-2.5 rounded-full text-sm font-black text-foreground hover:text-foreground transition-all hover:bg-surface-hover [text-shadow:none]"
              >
                {enableArtistMain ? '🎵 アーティストリスト' : '🎵 楽曲リスト'}
              </Link>
              <div className="px-6 py-2.5 rounded-full text-sm font-black bg-[var(--color-cyan-500)] text-white shadow-[0_0_15px_var(--color-glow)] [text-shadow:none]">
                🎨 イラストリスト
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selection List with Sorting Capability */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <IllustrationSelectionListContainer 
          initialPlaylists={illustrationPlaylists} 
          previewQuery={previewQuery} 
          enableArtistMain={enableArtistMain}
        />
      </section>

      <footer className="border-t border-surface-border bg-background py-24 text-center text-foreground">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <img src={defaultTheme.logoUrl} alt="Logo" className="w-32 mx-auto opacity-30 grayscale" style={{ mixBlendMode: 'screen', objectFit: 'contain' }} />
          <p className="text-xs tracking-[0.4em] font-light uppercase">© {new Date().getFullYear()} {defaultLabels.siteTitle}</p>
        </div>
      </footer>
    </main>
  );
}
