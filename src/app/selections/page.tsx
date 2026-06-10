import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { encodeSelectionId } from '@/lib/id-utils';
import SelectionListContainer from '@/components/SelectionListContainer';

export const revalidate = 3600;

export default async function SelectionsIndexPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  const isPreview = preview === 'honban';
  const previewQuery = isPreview ? '?preview=honban' : '';

  // Fetch all user playlists, ordered by newest first
  // 1回目と2回目以降のリストを両方取得
  const [mainPlaylists, subPlaylists] = await Promise.all([
    prisma.userPlaylist.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userPlaylistSub.findMany({
      orderBy: { createdAt: 'desc' },
    })
  ]);

  return (
    <main className="min-h-screen bg-background text-white selection:bg-[var(--color-cyan-500)] selection:text-white font-sans overflow-x-hidden relative">
      {/* Back Button (Fixed/Absolute Top Left) */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-30">
        <Link href={`/${previewQuery}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface/80 backdrop-blur-md border border-surface-border hover:border-purple-500 hover:text-purple-400 transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform text-lg">←</span>
          <span className="text-xs md:text-sm font-black tracking-widest uppercase">Back to Top</span>
        </Link>
      </div>

      {/* Header Section */}
      <section className="relative pt-16 pb-6 md:pt-20 md:pb-8 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-black to-black z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic">
            みんなの<span className="text-purple-400">推し曲リスト</span>
          </h1>
          <p className="text-2xl md:text-4xl font-black tracking-tight text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] leading-tight">
            リスナーが選んだ珠玉のセレクション。
          </p>
          <p className="text-gray-400 max-w-xl mx-auto text-xs md:text-sm font-bold tracking-widest uppercase opacity-80">
            それぞれの想いが詰まったアピールポイントをチェックしましょう。
          </p>
          
          <div className="pt-6 flex justify-center">
            <div className="inline-flex bg-surface/50 p-1.5 rounded-full border border-surface-border backdrop-blur-sm">
              <div className="px-6 py-2.5 rounded-full text-sm font-black bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                🎵 楽曲リスト
              </div>
              <Link 
                href={`/selections/illustrations${previewQuery}`}
                className="px-6 py-2.5 rounded-full text-sm font-black text-gray-500 hover:text-foreground transition-all hover:bg-gray-800"
              >
                🎨 イラストリスト
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Selection List with Sorting Capability */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <SelectionListContainer 
          initialPlaylists={mainPlaylists} 
          subPlaylists={subPlaylists}
          previewQuery={previewQuery} 
        />
      </section>

      <footer className="border-t border-surface-border bg-background py-24 text-center text-gray-400">
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
