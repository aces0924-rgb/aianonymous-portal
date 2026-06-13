import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ScheduleJumpSelect from '@/components/ScheduleJumpSelect';
import ScheduleItemProgress from '@/components/ScheduleItemProgress';
import TrackInterestStar from '@/components/TrackInterestStar';
import PremiereThumbnailUploader from '@/components/PremiereThumbnailUploader';

import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

export default async function SchedulePage(props: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ preview?: string }> }) {
  const { eventSlug } = await props.params;
  const searchParams = await props.searchParams;
  const isHonban = searchParams.preview === 'honban';

  // Get the event to fetch its settings properly
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();

  const getCachedScheduleData = unstable_cache(
    async (eventId: string, isHonban: boolean) => {
      const [schedule, tracks, shareBasePostUrlSetting] = await Promise.all([
        prisma.premiereSchedule.findMany({
          where: isHonban ? {} : { isPublic: true },
          orderBy: { day: 'asc' },
        }),
        prisma.trackHonban.findMany({
          where: { eventId, published: true },
          orderBy: { entryNo: 'asc' },
          select: { id: true, entryNo: true, title: true }
        }),
        (prisma as any).setting.findUnique({ where: { eventId_key: { eventId, key: 'SHARE_BASE_POST_URL' } } })
      ]);
      return { schedule, tracks, shareBasePostUrl: shareBasePostUrlSetting?.value || "" };
    },
    ['event-schedule-data'],
    { revalidate: 60 }
  );

  const { schedule, tracks, shareBasePostUrl } = await getCachedScheduleData(event.id, isHonban);

  const getJstDateString = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const todayStr = getJstDateString(new Date());

  const dayFormatter = new Intl.DateTimeFormat('ja-JP', { weekday: 'short', timeZone: 'Asia/Tokyo' });
  const dateFormatter = new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo' });
  const timeFormatter = new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tokyo' });

  const todayItem = schedule.find(item => getJstDateString(new Date(item.date)) === todayStr);

  const sortedSchedule = [...schedule].sort((a, b) => {
    if (a.day === 0) return -1;
    if (a.day === 16) return 1;
    return a.day - b.day;
  });

  return (
    <main className="min-h-screen bg-background text-white selection:bg-[var(--color-cyan-500)]/30 overflow-x-hidden flex flex-col items-center relative font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(6,182,212,0.15),_transparent)] pointer-events-none" />

      <div className="absolute left-6 top-8 z-50">
        <Link 
          href={`/${eventSlug}`} 
          className="flex items-center gap-2 text-[10px] font-black tracking-widest text-neutral-500 hover:text-[var(--color-cyan-400)] transition-colors uppercase group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <section className="w-full pt-32 pb-8 flex flex-col items-center text-center relative px-6">
        <div className="inline-block px-4 py-1 rounded-full border border-[var(--color-cyan-400)]/30 bg-[var(--color-cyan-500)]/20 text-[var(--color-cyan-400)] text-[10px] font-black tracking-[0.4em] uppercase mb-8 animate-pulse">
          Broadcast Schedule
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-400)] via-white to-purple-500 drop-shadow-[0_0_30px_var(--color-glow)]">
            YouTube PREMIERE
          </span>
        </h1>
        <p className="text-neutral-500 text-xs font-bold tracking-[0.5em] uppercase">共感の物語が、ここから動き出す。</p>
      </section>

      {/* FEATURED: Today's Program (Optimized for visibility) */}
      {todayItem && (
        <section className="max-w-7xl w-full px-6 mb-20 relative">
          <div className="relative group rounded-[3rem] border-2 border-[var(--color-cyan-400)] bg-[var(--color-cyan-500)]/20 shadow-[0_0_80px_var(--color-glow)] overflow-hidden backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan-400)]/10 via-transparent to-purple-500/10 pointer-events-none" />
            
            <div className="relative p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-start">
              {/* Left: Info (Condensed) */}
              <div className="w-full lg:w-[420px] shrink-0 space-y-10">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[var(--color-cyan-500)] text-black font-black text-[11px] tracking-widest uppercase shadow-lg shadow-cyan-500/40">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-background opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-background"></span>
                  </span>
                  NOW SHOWING / TODAY
                </div>

                <div className="space-y-4">
                  <div className="text-[var(--color-cyan-400)] font-mono text-xl font-black tracking-[0.4em] uppercase ">
                    {todayItem.day === 0 ? 'DAY 00' : todayItem.day === 16 ? 'FINAL DAY' : `DAY ${String(todayItem.day).padStart(2, '0')}`}
                  </div>
                  <h2 className="text-7xl md:text-8xl font-black tracking-tighter leading-none text-foreground">
                    {dateFormatter.format(new Date(todayItem.date))}
                    <span className="text-[var(--color-cyan-400)] text-4xl md:text-5xl italic block md:inline-block md:ml-4">({dayFormatter.format(new Date(todayItem.date))})</span>
                  </h2>
                  <div className="text-4xl font-black text-neutral-400 tracking-wider">
                    {timeFormatter.format(new Date(todayItem.date))}〜 <span className="text-xl font-bold ml-1">START</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  {/* 1. YouTube視聴ボタン */}
                  {todayItem.youtubeUrl && (
                    <a 
                      href={todayItem.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl bg-red-600 text-white font-black text-2xl tracking-widest hover:bg-red-500 transition-all active:scale-[0.98] shadow-2xl"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      WATCH
                    </a>
                  )}

                  {/* 2. サムネイル応募・応募済み表示（放送開始3時間前締め切り） */}
                  {(() => {
                    const now = new Date();
                    const dateLimit = new Date(todayItem.date.getTime() - 3 * 60 * 60 * 1000);
                    const isBeforeLimit = now < dateLimit;

                    if (todayItem.thumbnailDriveId) {
                      return (
                        <div className="w-full py-6 rounded-2xl bg-green-950/20 border border-green-500/30 text-green-400 font-black text-2xl tracking-widest text-center select-none shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                          ✓ 応募済み
                        </div>
                      );
                    } else if (isBeforeLimit) {
                      return <PremiereThumbnailUploader day={todayItem.day} size="large" />;
                    } else if (!todayItem.youtubeUrl) {
                      return (
                        <div className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black text-2xl tracking-widest text-center select-none">
                          LINK PENDING
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `【本日の#アノフェス】\n本日 ${dateFormatter.format(new Date(todayItem.date))} ${timeFormatter.format(new Date(todayItem.date))}〜 プレミア公開！\n\n${todayItem.day === 0 || todayItem.day === 16 ? `${todayItem.remarks}\n` : `対象楽曲：${todayItem.trackRange} (${todayItem.trackCount}曲)\n`}プレミア会場はこちら！\nみんなで一緒に盛り上がろう！✨\n\n📺 YouTube: ${todayItem.youtubeUrl || '(準備中)'}\n\n#アノフェス #Day${todayItem.day}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white text-black font-black text-xl hover:bg-[var(--color-cyan-500)] transition-all active:scale-[0.98] shadow-2xl"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    宣伝
                  </a>

                  {/* Match Rate (Horizontal style) below buttons */}
                  <div className="pt-2">
                    {(() => {
                      const rangeMatch = todayItem.trackRange.match(/No\.(\d+)\s*〜\s*No\.(\d+)/);
                      const startNo = rangeMatch ? parseInt(rangeMatch[1]) : 0;
                      const endNo = rangeMatch ? parseInt(rangeMatch[2]) : 0;
                      const dayTrackIds = tracks
                        .filter(t => {
                          const num = parseInt(t.entryNo || "0");
                          return num >= startNo && num <= endNo;
                        })
                        .map(t => t.id);
                      return <ScheduleItemProgress trackIds={dayTrackIds} size="large" />;
                    })()}
                  </div>
                </div>
              </div>

              {/* Right: Lineup (Expanding flex-1) */}
              {todayItem.day !== 0 && todayItem.day !== 16 && (
                <div className="flex-1 w-full bg-background/40 rounded-[3rem] border border-[var(--color-cyan-400)]/30 p-10 backdrop-blur-md shadow-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan-400)]/5 to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="text-[12px] font-black text-[var(--color-cyan-400)] tracking-[0.5em] uppercase mb-8 text-center border-b border-[var(--color-cyan-400)]/20 pb-6">Day {todayItem.day} Full Lineup</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    {(() => {
                      const rangeMatch = todayItem.trackRange.match(/No\.(\d+)\s*〜\s*No\.(\d+)/);
                      const startNo = rangeMatch ? parseInt(rangeMatch[1]) : 0;
                      const endNo = rangeMatch ? parseInt(rangeMatch[2]) : 0;
                      const dayTracks = tracks.filter(t => {
                        const num = parseInt(t.entryNo || "0");
                        return num >= startNo && num <= endNo;
                      });
                      return dayTracks.map(t => (
                        <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/10 px-3 rounded-xl transition-colors group/item truncate">
                          <span className="text-[var(--color-cyan-400)] font-mono text-xs font-black shrink-0">#{t.entryNo}</span>
                          <span className="text-sm md:text-base font-bold text-neutral-200 truncate group-hover/item:text-foreground">{t.title}</span>
                          <TrackInterestStar trackId={t.id} />
                        </div>
                      ));
                    })()}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 text-center border-t border-white/5">
                    <div className="text-[9px] font-bold text-neutral-600 tracking-widest uppercase">
                      Total {todayItem.trackCount} Tracks Featured Today
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MAIN GRID */}
      <section className="max-w-7xl w-full px-6 pb-32">
        <div className="flex items-center gap-6 mb-12">
          <h3 className="text-xs font-black tracking-[0.6em] text-neutral-600 uppercase whitespace-nowrap">Timeline</h3>
          <div className="h-px w-full bg-neutral-900" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedSchedule.map((item) => {
            const itemDate = new Date(item.date);
            const isTodayItem = getJstDateString(itemDate) === todayStr;

            const isSpecial = item.day === 0 || item.day === 16;
            const dayLabel = item.day === 0 ? '00' : item.day === 16 ? 'LAST' : String(item.day).padStart(2, '0');

            const rangeMatch = item.trackRange.match(/No\.(\d+)\s*〜\s*No\.(\d+)/);
            const startNo = rangeMatch ? parseInt(rangeMatch[1]) : 0;
            const endNo = rangeMatch ? parseInt(rangeMatch[2]) : 0;
            const dayTracks = tracks.filter(t => {
              const num = parseInt(t.entryNo || "0");
              return num >= startNo && num <= endNo;
            });

            return (
              <div key={item.id} className={`group relative rounded-[2rem] border transition-all ${isTodayItem ? 'border-[var(--color-cyan-400)] bg-[var(--color-cyan-500)]/20' : 'border-white/5 bg-neutral-950/40'}`}>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="text-4xl font-black opacity-10 font-mono text-[var(--color-cyan-400)]">{dayLabel}</div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {isTodayItem && <span className="px-3 py-1 rounded-full bg-[var(--color-cyan-500)] text-black text-[9px] font-black uppercase tracking-widest">TODAY</span>}
                      {!isSpecial && (
                        <ScheduleItemProgress trackIds={dayTracks.map(t => t.id)} />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black text-[var(--color-cyan-400)] uppercase">{dateFormatter.format(itemDate)} ({dayFormatter.format(itemDate)})</div>
                    <div className="text-3xl font-black text-foreground tracking-tight">{timeFormatter.format(itemDate)}〜</div>
                  </div>
                  {!isSpecial ? (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-neutral-200">{item.trackRange}</div>
                      <ScheduleJumpSelect tracks={dayTracks} />
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-white/5 text-xs font-bold bg-white/5">{item.remarks}</div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    {/* 1. YouTube視聴ボタン */}
                    {item.youtubeUrl && (
                      <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-4 rounded-2xl bg-red-600 text-center font-black text-xs hover:bg-red-500">
                        WATCH
                      </a>
                    )}

                    {/* 2. サムネイル応募・応募済み表示（放送開始3時間前締め切り） */}
                    {(() => {
                      const now = new Date();
                      const dateLimit = new Date(item.date.getTime() - 3 * 60 * 60 * 1000);
                      const isBeforeLimit = now < dateLimit;

                      if (item.thumbnailDriveId) {
                        return (
                          <div className="block w-full py-4 rounded-2xl bg-green-950/20 border border-green-500/30 text-center font-black text-xs text-green-400 select-none shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            ✓ 応募済み
                          </div>
                        );
                      } else if (isBeforeLimit) {
                        return <PremiereThumbnailUploader day={item.day} />;
                      } else if (!item.youtubeUrl) {
                        return (
                          <div className="block w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-center font-black text-[10px] text-foreground select-none">
                            LINK PENDING
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `【#アノフェス #${item.day === 0 ? 'Eve' : item.day === 16 ? 'Final' : `Day${item.day}`}】 ${dateFormatter.format(itemDate)} ${timeFormatter.format(itemDate)}〜\n${!isSpecial ? `対象楽曲：${item.trackRange}\n` : `${item.remarks}\n`}\n📺 YouTube: ${item.youtubeUrl || '(準備中)'}\n\n#アノフェス`
                      )}`}
                      target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-2xl bg-background border border-white/10 text-center font-black text-[10px] hover:border-[var(--color-cyan-400)]/50 text-foreground"
                    >
                      Xで宣伝
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="w-full py-20 text-center border-t border-white/5 bg-background text-neutral-700">
        <p className="text-[10px] font-mono tracking-[0.5em] uppercase">© 2026 AI-ANONYMOUS MUSIC FES.</p>
      </footer>
    </main>
  );
}
