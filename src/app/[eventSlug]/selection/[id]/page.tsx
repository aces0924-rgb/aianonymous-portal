import prisma from '@/lib/prisma';
import TrackCard from '@/components/TrackCard';
import Link from 'next/link';
import Image from 'next/image';
import ShareButton from '@/components/ShareButton';
import { getPlaylistById, getAllPlaylistsByUserName } from '@/app/recommend/actions';
import { notFound } from 'next/navigation';
import { decodeSelectionId, encodeSelectionId } from '@/lib/id-utils';

export const revalidate = 3600;

export default async function SelectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string; id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { eventSlug, id: encodedId } = await params;
  const { preview } = await searchParams;

  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();
  
  // Decode ID with check digit
  const dbId = decodeSelectionId(encodedId);
  
  if (dbId === null) {
    notFound();
  }

  // Fetch from DB by ID
  const playlist = await getPlaylistById(dbId);
  
  if (!playlist || playlist.eventId !== event?.id) {
    notFound();
  }

  // 同じユーザーの全リストを取得
  const allUserPlaylists = await getAllPlaylistsByUserName(eventSlug, playlist.userName);

  const idArray = playlist.trackIds.split(',').map((id: any) => parseInt(id)).filter((id: any) => !isNaN(id));

  // Check active table
  const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event?.id, key: 'ACTIVE_TRACK_TABLE' } } })
  // URLパラメータで preview=honban が指定されているか、全体設定が track_honban の場合に本番用を表示
  const activeTable = (preview === 'honban') ? 'track_honban' : (activeTableSetting?.value || "track")

  const shareBasePostUrlSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event?.id, key: 'SHARE_BASE_POST_URL' } } })
  const shareBasePostUrl = shareBasePostUrlSetting?.value || ""

  const tracksSelect = {
    id: true,
    entryNo: true,
    title: true,
    genre: true,
    songUrl: true,
    audioUrl: true,
    published: true,
  }

  const tracks = activeTable === "track_honban"
    ? await prisma.trackHonban.findMany({
        where: { id: { in: idArray } },
        select: tracksSelect,
      })
    : await prisma.track.findMany({
        where: { id: { in: idArray } },
        select: tracksSelect,
      });

  // Keep original order
  const sortedTracks = idArray.map((id: any) => tracks.find((t: any) => t?.id === id)).filter(Boolean);

  const previewQuery = preview === 'honban' ? '?preview=honban' : '';

  return (
    <main className="min-h-screen bg-background text-white selection:bg-[var(--color-cyan-500)] selection:text-white font-sans overflow-x-hidden relative">
      {/* Back Button (Fixed/Absolute Top Left) */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-30">
        <Link href={`/${eventSlug}/selections${previewQuery}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface/80 backdrop-blur-md border border-surface-border hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform text-lg">←</span>
          <span className="text-xs md:text-sm font-black tracking-widest uppercase">推薦作品リスト一覧へ</span>
        </Link>
      </div>

      {/* Dynamic Header */}
      <section className="relative pt-16 pb-2 md:pt-20 md:pb-4 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cyan-400)]/10 via-black to-black z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-cyan-500)]/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-5xl font-black tracking-tighter leading-tight italic">
            <span className="text-[var(--color-cyan-400)] drop-shadow-[0_0_10px_var(--color-glow)]">{playlist.userName}</span> 様の
            推薦作品リスト
          </h1>
          
          <div className="pt-3 flex flex-col items-center gap-2">
             {playlist?.appeal && (
               <div className="relative max-w-3xl mx-auto">
                 <p className="text-sm md:text-base font-medium text-gray-300 leading-relaxed italic px-8">
                   <span className="text-[var(--color-cyan-400)]/50 mr-2">"</span>
                   {playlist.appeal}
                   <span className="text-[var(--color-cyan-400)]/50 ml-2">"</span>
                 </p>
               </div>
             )}
             <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-cyan-400)]/50 to-transparent mt-2 mb-4"></div>
             
             {/* Share Section (Moved to Header) */}
             <div className="animate-in fade-in zoom-in duration-700">
               <ShareButton userName={playlist.userName} id={dbId} basePostUrl={shareBasePostUrl} />
             </div>

             {/* Tab Navigation for Multiple Playlists */}
             {allUserPlaylists.length > 1 && (
               <div className="flex gap-2 mt-8 bg-surface/50 p-1.5 rounded-full border border-surface-border backdrop-blur-sm">
                 {allUserPlaylists.map((p, idx) => {
                   const isActive = p.id === dbId;
                   const label = idx === 0 ? "1st List" : idx === 1 ? "2nd List" : "3rd List";
                   return (
                     <Link
                       key={p.id}
                       href={`/${eventSlug}/selection/${encodeSelectionId(p.id)}${previewQuery}`}
                       className={`px-6 py-2 rounded-full text-xs md:text-sm font-black transition-all ${
                         isActive 
                           ? "bg-[var(--color-cyan-500)] text-black shadow-[0_0_15px_var(--color-glow)] scale-105" 
                           : "text-gray-500 hover:text-white hover:bg-gray-800"
                       }`}
                     >
                       {label}
                     </Link>
                   );
                 })}
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Tracks Container */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-surface/30 border border-surface-border rounded-[2.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 text-left">
            {sortedTracks.map((t: any, idx: number) => (
              <div key={t?.id} className="relative">
                <div className="absolute -left-4 -top-4 w-12 h-12 flex items-center justify-center bg-surface border-2 border-[var(--color-cyan-400)] text-[var(--color-cyan-400)] font-black rounded-full z-20 text-xl italic shadow-lg">
                  {idx + 1}
                </div>
                <TrackCard track={t} preview={preview} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="text-center pt-8 space-y-6">
          <p className="text-gray-500 font-light italic text-sm">
            このリストは {playlist.userName} さんによって作成されました。<br />あなたも推し10曲を見つけて共有しませんか？
          </p>
          <Link 
            href={`/${eventSlug}/#tracks`} 
            className="inline-block px-12 py-5 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-black transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            自分もリストを作る
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-border bg-background py-24 text-center text-gray-400 mt-20">
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
