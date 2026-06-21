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
      const [schedule, shareBasePostUrlSetting, activeTableSetting] = await Promise.all([
        prisma.premiereSchedule.findMany({
          where: isHonban ? {} : { isPublic: true },
          orderBy: { day: 'asc' },
        }),
        (prisma as any).setting.findUnique({ where: { eventId_key: { eventId, key: 'SHARE_BASE_POST_URL' } } }),
        (prisma as any).setting.findUnique({ where: { eventId_key: { eventId, key: 'ACTIVE_TRACK_TABLE' } } })
      ]);

      const activeTable = isHonban ? 'track_honban' : (activeTableSetting?.value || "track");
      const tracksSelect = { id: true, entryNo: true, title: true, artistName: true };
      
      const tracks = activeTable === 'track_honban'
        ? await prisma.trackHonban.findMany({
            where: { eventId, published: true },
            orderBy: { entryNo: 'asc' },
            select: tracksSelect
          })
        : await prisma.track.findMany({
            where: { eventId, published: true },
            orderBy: { entryNo: 'asc' },
            select: tracksSelect
          });
      return { schedule, tracks, shareBasePostUrl: shareBasePostUrlSetting?.value || "" };
    },
    ['event-schedule-data'],
    { revalidate: 60 }
  );
  
  const timetableUrlSetting = await (prisma as any).setting.findUnique({
    where: { eventId_key: { eventId: event.id, key: 'timetableUrl' } }
  });
  const timetableUrl = timetableUrlSetting?.value;

  const { schedule, tracks, shareBasePostUrl } = await getCachedScheduleData(event.id, isHonban);

  const themeConfig = JSON.parse(event.themeConfig || '{}');
  const bgUrl = themeConfig.bgUrl;
  const featureFlags = typeof event.featureFlags === 'string' ? JSON.parse(event.featureFlags) : (event.featureFlags || {});
  const enableArtistMain = featureFlags.enableArtistMain === true;

  const labelConfig = typeof event.labelConfig === 'string' ? JSON.parse(event.labelConfig) : (event.labelConfig || {});
  const hashtag = labelConfig.shareHashtag || `#${event.title.replace(/\s+/g, '')}`;

  const getYoutubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getDayTracks = (trackRange: string) => {
    if (!trackRange) return [];
    if (trackRange.includes(',')) {
      const targetEntryNos = trackRange.split(',').map(s => s.trim());
      return tracks.filter(t => t.entryNo && targetEntryNos.includes(t.entryNo));
    }
    const rangeMatch = trackRange.match(/No\.(\d+)\s*〜\s*No\.(\d+)/);
    const startNo = rangeMatch ? parseInt(rangeMatch[1]) : 0;
    const endNo = rangeMatch ? parseInt(rangeMatch[2]) : 0;
    return tracks.filter(t => {
      const num = parseInt(t.entryNo || "0");
      return num >= startNo && num <= endNo;
    });
  };

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
    <main className="min-h-screen bg-background text-foreground selection:bg-[var(--color-cyan-500)]/30 overflow-x-hidden flex flex-col items-center relative font-sans">
      {/* Event Background Image */}
      {bgUrl && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-top bg-no-repeat opacity-50 mix-blend-overlay"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--color-cyan-500)_15%,_transparent)] opacity-10 pointer-events-none z-0" />

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

      <section className="w-full pt-20 pb-4 flex flex-col items-center text-center relative px-6 z-10">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 text-foreground drop-shadow-[0_0_30px_var(--color-glow)]">
          YouTube PREMIERE
        </h1>
        <p className="text-foreground opacity-80 text-xs font-bold tracking-[0.5em] uppercase mb-8">共感の物語が、ここから動き出す。</p>

        {timetableUrl && (
          <a 
            href={timetableUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-black/70 backdrop-blur-md border border-[var(--color-cyan-400)]/50 text-white font-black tracking-widest text-sm hover:bg-[var(--color-cyan-400)] hover:text-black hover:border-[var(--color-cyan-400)] transition-all shadow-xl mb-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            タイムテーブルを見る
          </a>
        )}
      </section>

      {/* FEATURED: Today's Program (Optimized for visibility) */}
      {todayItem && (
        <section className="max-w-7xl w-full px-6 mb-20 relative z-10">
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cyan-500)]/20 border border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] text-xs font-black tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan-400)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-cyan-500)]"></span>
                    </span>
                    TODAY'S PREMIERE
                  </div>
                  <div className="text-[var(--color-cyan-400)] font-black text-xl tracking-widest">{dateFormatter.format(new Date(todayItem.date))} ({['日', '月', '火', '水', '木', '金', '土'][new Date(todayItem.date).getDay()]})</div>
                  <div className="text-6xl md:text-7xl font-black tracking-tighter text-foreground">
                    {timeFormatter.format(new Date(todayItem.date))}<span className="text-4xl text-foreground/50">〜</span>
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

                  {/* 2. サムネイル応募・応募済み表示 */}
                  {(() => {
                    if (!todayItem.acceptsThumbnail) {
                      if (!todayItem.youtubeUrl) {
                        return (
                          <div className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black text-2xl tracking-widest text-center select-none">
                            LINK PENDING
                          </div>
                        );
                      }
                      return null;
                    }

                    const now = new Date();
                    const dateLimit = new Date(new Date(todayItem.date).getTime() - 3 * 60 * 60 * 1000);
                    const isBeforeLimit = now < dateLimit;

                    if (todayItem.thumbnailDriveId) {
                      return null; // 応募済みバッジは不要
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
                      `【本日の#アノフェス】\n本日 ${dateFormatter.format(new Date(todayItem.date))} ${timeFormatter.format(new Date(todayItem.date))}〜 プレミア公開！\n\n${todayItem.day === 0 || todayItem.day === 16 ? `${todayItem.remarks}\n` : ''}プレミア会場はこちら！\nみんなで一緒に盛り上がろう！✨\n\n📺 YouTube: ${todayItem.youtubeUrl || '(準備中)'}\n\n#Day${todayItem.day}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-foreground text-background font-black text-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-2xl"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    宣伝
                  </a>

                  {/* Match Rate (Horizontal style) below buttons */}
                  <div className="pt-2">
                    <ScheduleItemProgress trackIds={getDayTracks(todayItem.trackRange).map(t => t.id)} size="large" />
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
                      {getDayTracks(todayItem.trackRange).map(t => (
                        <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/10 px-3 rounded-xl transition-colors group/item truncate">
                          <span className="text-[var(--color-cyan-400)] font-mono text-xs font-black shrink-0">#{t.entryNo}</span>
                          <span className="text-sm md:text-base font-bold text-foreground opacity-80 truncate group-hover/item:opacity-100">
                            {enableArtistMain ? (t.artistName || t.title) : t.title}
                          </span>
                          <TrackInterestStar trackId={t.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 text-center border-t border-white/5">
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MAIN GRID */}
      <section className="max-w-7xl w-full px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedSchedule.map((item) => {
            const itemDate = new Date(item.date);
            const isTodayItem = getJstDateString(itemDate) === todayStr;

            const isSpecial = item.day === 0 || item.day === 16;
            const dayLabel = item.day === 0 ? '00' : item.day === 16 ? 'LAST' : String(item.day).padStart(2, '0');

            const dayTracks = getDayTracks(item.trackRange);
            const videoId = getYoutubeVideoId(item.youtubeUrl);

            return (
              <div key={item.id} className={`group relative rounded-[2rem] border transition-all overflow-hidden flex flex-col ${isTodayItem ? 'border-[var(--color-cyan-400)] bg-[var(--color-cyan-500)]/20' : 'border-white/5 bg-neutral-950/40'}`}>
                {/* Thumbnail Section */}
                <div className="w-full aspect-video bg-black/40 relative shrink-0 border-b border-white/5">
                  {videoId ? (
                    <img 
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                      alt="YouTube Thumbnail" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                      <span className="text-foreground opacity-30 font-black tracking-[0.5em] text-[10px]">COMING SOON</span>
                    </div>
                  )}
                  {isTodayItem && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[var(--color-cyan-500)] text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
                      TODAY
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0 rounded bg-[var(--color-cyan-500)]/20 text-[var(--color-cyan-400)] text-[9px] font-black tracking-widest uppercase">
                          DAY {dayLabel}
                        </span>
                        <span className="text-[10px] font-bold text-foreground opacity-80">
                          {dateFormatter.format(itemDate)} ({dayFormatter.format(itemDate)})
                        </span>
                      </div>
                      <div className="text-2xl font-black text-foreground tracking-tight">
                        {timeFormatter.format(itemDate)}<span className="text-lg text-foreground/50">〜</span>
                      </div>
                    </div>
                    {!isSpecial && (
                      <div className="shrink-0">
                        <ScheduleItemProgress trackIds={dayTracks.map(t => t.id)} />
                      </div>
                    )}
                  </div>
                  {!isSpecial ? (
                    <div className="space-y-1">
                      <ScheduleJumpSelect tracks={dayTracks} enableArtistMain={enableArtistMain} />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg border border-white/5 text-[10px] font-bold bg-white/5">{item.remarks}</div>
                  )}

                  <div className="flex flex-col gap-1.5 pt-1 mt-auto">
                    {/* 1. YouTube視聴ボタン */}
                    {item.youtubeUrl && (
                      <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 rounded-xl bg-red-600 text-center font-black text-[10px] hover:bg-red-500">
                        WATCH
                      </a>
                    )}

                    {/* 2. サムネイル応募・応募済み表示 */}
                    {(() => {
                      if (!item.acceptsThumbnail) {
                        if (!item.youtubeUrl) {
                          return (
                            <div className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center font-black text-[10px] text-foreground select-none">
                              LINK PENDING
                            </div>
                          );
                        }
                        return null;
                      }

                      const now = new Date();
                      const dateLimit = new Date(itemDate.getTime() - 3 * 60 * 60 * 1000);
                      const isBeforeLimit = now < dateLimit;

                      if (item.thumbnailDriveId) {
                        return null; 
                      } else if (isBeforeLimit) {
                        return <PremiereThumbnailUploader day={item.day} />;
                      } else if (!item.youtubeUrl) {
                        return (
                          <div className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center font-black text-[10px] text-foreground select-none">
                            LINK PENDING
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `【${hashtag} #${item.day === 0 ? 'Eve' : item.day === 16 ? 'Final' : `Day${item.day}`}】 ${dateFormatter.format(itemDate)} ${timeFormatter.format(itemDate)}〜\n${isSpecial && item.remarks ? `${item.remarks}\n` : ''}\n📺 YouTube: ${item.youtubeUrl || '(準備中)'}`
                      )}`}
                      target="_blank" rel="noopener noreferrer" className="block w-full py-2 rounded-xl bg-background border border-white/10 text-center font-black text-[9px] hover:border-[var(--color-cyan-400)]/50 text-foreground"
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

      <footer className="w-full py-20 text-center border-t border-white/10 bg-background/80 backdrop-blur-md text-foreground relative z-10">
        <p className="text-[10px] font-mono tracking-[0.5em] uppercase">© 2026 AI-ANONYMOUS MUSIC FES.</p>
      </footer>
    </main>
  );
}
