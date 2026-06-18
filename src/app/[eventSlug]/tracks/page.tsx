import { unstable_cache } from 'next/cache';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import TrackListCard from '@/components/TrackListCard';
import TrackListFilterable from '@/components/TrackListFilterable';
import SelectionIndicator from '@/components/SelectionIndicator';
import ClearFavoritesButton from '@/components/ClearFavoritesButton';
import ShareButton from '@/components/ShareButton';
import HelpFloatingButton from '@/components/HelpFloatingButton';

import { notFound } from 'next/navigation';

export default async function TracksListPage({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ table?: string, preview?: string }> }) {
  const { eventSlug } = await params;
  const { table, preview } = await searchParams;
  
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();
  
  const featureFlags = JSON.parse(event.featureFlags || '{}');
  const showCreators = featureFlags.enableShowCreators === true;
  const isHonban = preview === 'honban' || table === 'track_honban';
  const previewQuery = isHonban ? '?preview=honban' : '';

  const getCachedTracksData = unstable_cache(
    async (eventId: string, isHonban: boolean, showCreators: boolean) => {
      const [settings, thumbnails] = await Promise.all([
        (prisma as any).setting.findMany({ where: { eventId } }),
        prisma.trackThumbnail.findMany({
          where: { status: { in: ['PENDING', 'APPROVED'] } },
          select: { trackId: true }
        })
      ]);
      
      const activeTableSetting = settings.find((s: any) => s.key === 'ACTIVE_TRACK_TABLE');
      const activeTable = isHonban ? 'track_honban' : (activeTableSetting?.value || "track");
      
      const tracksSelect: any = {
        id: true, entryNo: true, title: true, genre: true, songUrl: true, audioUrl: true, published: true,
      };
      
      if (showCreators) {
        tracksSelect.artistName = true;
      }
      
      const fetchedTracks = activeTable === 'track_honban'
        ? await prisma.trackHonban.findMany({ 
            where: { eventId, published: true }, 
            select: tracksSelect,
            orderBy: { entryNo: 'asc' } 
          })
        : await prisma.track.findMany({ 
            where: { eventId, published: true }, 
            select: tracksSelect,
            orderBy: { entryNo: 'asc' } 
          });
          
      return { activeTable, fetchedTracks, thumbnails };
    },
    ['event-tracks-data'],
    { revalidate: 60 } // 60秒キャッシュ
  );

  const { activeTable, fetchedTracks: tracks, thumbnails } = await getCachedTracksData(event.id, isHonban, showCreators);
  const thumbSet = new Set(thumbnails.map(t => t.trackId));

  const tracksWithStatus = tracks.map(track => ({
    ...track,
    hasThumbnail: thumbSet.has(track.id)
  }));

  const homeUrl = preview === 'honban' ? `/${eventSlug}?preview=honban` : `/${eventSlug}`;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[var(--color-cyan-500)] selection:text-white font-sans overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-[var(--color-cyan-400)]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href={homeUrl} 
            className="text-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] transition-colors flex items-center gap-2 text-sm font-bold shrink-0"
          >
            <span className="text-lg">◀</span> <span>TOPへ戻る</span>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-foreground inline-block">
              Submitted Tracks
            </h1>
          </div>
          <div className="hidden sm:block w-[100px]"></div> {/* Spacer */}
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <SelectionIndicator /* activeTable={activeTable} */ />

        <div className="mb-10 text-center">
          <p className="text-[var(--color-cyan-400)] font-mono text-sm tracking-[0.3em] uppercase mb-2">
            {featureFlags.enableArtistMain ? "Artists & Tracks" : "Archive"}
          </p>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">
            {featureFlags.enableArtistMain ? "参加アーティスト一覧" : "投稿作品一覧"}
          </h2>
          <p className="text-foreground text-sm max-w-2xl mx-auto mb-6">
            {featureFlags.enableArtistMain ? "エントリーされたすべての参加者と楽曲です。" : "エントリーされたすべての楽曲です。"}
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <ClearFavoritesButton />
            
            {/* ボタン凡例 */}
            <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-foreground bg-surface/30 px-5 py-2.5 rounded-full border border-surface-border/50">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--color-cyan-400)]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                プレイヤー再生
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                サムネ拡大
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                気になる
              </span>
            </div>
          </div>
        </div>

        <TrackListFilterable 
          initialTracks={tracksWithStatus} 
          preview={preview} 
          enableArtistMain={featureFlags.enableArtistMain} 
          eventSlug={eventSlug} 
          enableThumbSubmit={featureFlags.enableThumbSubmit}
        />

        {tracks.length === 0 && (
          <div className="text-center py-20 border border-dashed border-surface-border rounded-3xl">
            <p className="text-foreground font-mono">No tracks found.</p>
          </div>
        )}
      </div>

      <SelectionIndicator />
      <HelpFloatingButton />

      <footer className="py-10 border-t border-surface-border text-center">
        <Link href="/" className="text-foreground hover:text-[var(--color-cyan-400)] transition-colors text-xs uppercase tracking-widest">
          Back to Entrance
        </Link>
      </footer>
    </main>
  );
}
