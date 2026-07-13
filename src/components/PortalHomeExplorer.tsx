'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Schedule = {
  id: number;
  title: string;
  date: string;
  order: number;
};

type PortalEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  themeConfig: string;
  featureFlags: string;
  labelConfig: string;
  createdAt: string;
  schedules: Schedule[];
};

type EventCard = {
  id: string;
  slug: string;
  title: string;
  periodText: string;
  descText: string;
  officialUrl: string;
  isExternalLinkOnly: boolean;
  bgUrl: string;
  category: 'active' | 'past';
};

type ThemeConfig = {
  bgUrl?: string;
  logoUrl?: string;
  [key: string]: unknown;
};

type FeatureFlags = {
  isExternalLinkOnly?: boolean;
  [key: string]: unknown;
};

type LabelConfig = {
  portalPeriod?: string;
  portalDescription?: string;
  portalOfficialUrl?: string;
  [key: string]: unknown;
};

type PortalHomeExplorerProps = {
  events: PortalEvent[];
  portalLogoUrl: string;
  portalLogoWidth?: string;
  portalArchiveUrl: string;
  eventCalendarUrl: string;
};

function parseDateKey(value: string): string | null {
  const match = value.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!match) return null;

  const year = match[1];
  const month = match[2].padStart(2, '0');
  const day = match[3].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractDateKeys(value: string): string[] {
  const keys = new Set<string>();
  if (!value) return [];

  const rangeMatch = value.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})\s*[-~〜]\s*(?:(\d{4})[./-])?(\d{1,2})[./-](\d{1,2})/);
  if (rangeMatch) {
    const startKey = parseDateKey(`${rangeMatch[1]}-${rangeMatch[2]}-${rangeMatch[3]}`);
    const endYear = rangeMatch[4] || rangeMatch[1];
    const endKey = parseDateKey(`${endYear}-${rangeMatch[5]}-${rangeMatch[6]}`);
    if (startKey) keys.add(startKey);
    if (endKey) keys.add(endKey);
  }

  for (const match of value.matchAll(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/g)) {
    const key = parseDateKey(`${match[1]}-${match[2]}-${match[3]}`);
    if (key) keys.add(key);
  }

  return Array.from(keys);
}

function getTokyoDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value || '0000';
  const month = parts.find((part) => part.type === 'month')?.value || '00';
  const day = parts.find((part) => part.type === 'day')?.value || '00';

  return `${year}-${month}-${day}`;
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value || '{}') as T;
  } catch {
    return fallback;
  }
}

function toEventCard(event: PortalEvent): EventCard {
  const themeConfig = parseJson<ThemeConfig>(event.themeConfig, {});
  const featureFlags = parseJson<FeatureFlags>(event.featureFlags, {});
  const labelConfig = parseJson<LabelConfig>(event.labelConfig, {});

  const bgUrl = themeConfig.bgUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80';
  const periodText = labelConfig.portalPeriod || '';
  const descText = labelConfig.portalDescription || event.description || '';
  const officialUrl = labelConfig.portalOfficialUrl || '';
  const isExternalLinkOnly = featureFlags.isExternalLinkOnly === true;

  const eventDateKeys = [
    ...extractDateKeys(periodText),
    ...event.schedules.flatMap((schedule) => extractDateKeys(schedule.date || '')),
  ];

  const latestKey = eventDateKeys.sort().at(-1) || getTokyoDateKey(new Date(event.createdAt));
  const category: EventCard['category'] = latestKey < getTokyoDateKey(new Date()) ? 'past' : 'active';

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    periodText,
    descText,
    officialUrl,
    isExternalLinkOnly,
    bgUrl,
    category,
  };
}

export default function PortalHomeExplorer({
  events,
  portalLogoUrl,
  portalLogoWidth,
  portalArchiveUrl,
  eventCalendarUrl,
}: PortalHomeExplorerProps) {
  const [view, setView] = useState<'active' | 'past'>('active');

  const groupedEvents = useMemo(() => {
    return events.map(toEventCard).reduce(
      (acc, event) => {
        acc[event.category].push(event);
        return acc;
      },
      { active: [] as EventCard[], past: [] as EventCard[] }
    );
  }, [events]);

  const visibleEvents = view === 'active' ? groupedEvents.active : groupedEvents.past;
  const activeCount = groupedEvents.active.length;
  const pastCount = groupedEvents.past.length;
  const numericLogoWidth = portalLogoWidth ? Number(portalLogoWidth) : Number.NaN;
  const resolvedLogoWidth = Number.isFinite(numericLogoWidth) && numericLogoWidth > 0 ? numericLogoWidth : 640;
  const resolvedLogoHeight = Math.max(1, Math.round(resolvedLogoWidth * 0.33));

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-8">
      <aside className="md:sticky md:top-8 h-fit rounded-[2rem] bg-gradient-to-b from-cyan-600/90 via-sky-500/90 to-emerald-400/90 text-white border border-white/20 shadow-[0_8px_30px_rgba(14,165,233,0.22)] backdrop-blur-md">
        <div className="p-5 md:p-6 flex flex-col gap-5">
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-white/65">Portal Events</p>
            <h1 className="text-lg md:text-2xl font-black tracking-tight">イベント一覧</h1>
            <p className="text-[11px] md:text-sm font-medium text-white/85 leading-relaxed">
              デスクトップでは、切り替え操作をサイドバーにまとめています。
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="inline-flex flex-col sm:flex-row md:flex-col rounded-[1.5rem] bg-white/20 border border-white/25 p-1 shadow-inner backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setView('active')}
                className={`px-4 md:px-6 py-2 rounded-full text-[11px] md:text-sm font-black tracking-widest transition-all ${
                  view === 'active' ? 'bg-white text-cyan-700 shadow-lg' : 'text-white/85 hover:text-white'
                }`}
              >
                開催前・開催中 ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setView('past')}
                className={`px-4 md:px-6 py-2 rounded-full text-[11px] md:text-sm font-black tracking-widest transition-all ${
                  view === 'past' ? 'bg-white text-cyan-700 shadow-lg' : 'text-white/85 hover:text-white'
                }`}
              >
                過去 ({pastCount})
              </button>
            </div>
            <a
              href="#event-calendar"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-cyan-700 font-black tracking-widest hover:bg-cyan-50 transition-colors shadow-lg"
            >
              <span className="text-sm">カレンダーへ</span>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </div>
      </aside>

      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="relative px-6 py-3 md:px-10 md:py-5 rounded-[2.5rem] bg-slate-900/50 backdrop-blur-lg border border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex justify-center items-center group overflow-hidden">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-cyan-500/10 via-transparent to-fuchsia-500/10 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
            <Image
              src={portalLogoUrl}
              alt="AI匿名フェス ポータル"
              width={resolvedLogoWidth}
              height={resolvedLogoHeight}
              unoptimized
              style={portalLogoWidth ? { width: `${resolvedLogoWidth}px`, height: 'auto', maxWidth: '100%' } : { width: 'min(100%, 20rem)', height: 'auto' }}
              className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleEvents.length === 0 ? (
            <div className="md:col-span-2 rounded-[2rem] bg-black/70 border border-white/10 p-8 md:p-12 text-center text-white/70 font-bold">
              {view === 'active' ? '開催前・開催中のイベントはまだありません。' : '過去のイベントはまだありません。'}
            </div>
          ) : (
            visibleEvents.map((event) => (
              <div
                key={event.id}
                className="relative block aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl opacity-85 hover:opacity-100 transition-all duration-500 group border border-slate-200 hover:border-cyan-400"
              >
                {event.isExternalLinkOnly && event.officialUrl ? (
                  <a href={event.officialUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={event.title} />
                ) : (
                  <Link href={`/${event.slug}`} className="absolute inset-0 z-10" aria-label={event.title} />
                )}

                <Image
                  src={event.bgUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-opacity duration-300 group-hover:opacity-80" />

                <div className="absolute inset-0 p-8 flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {event.periodText && (
                      <div className="mb-4 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 text-[10px] md:text-xs font-black tracking-widest backdrop-blur-md shadow-lg transition-transform duration-500 group-hover:-translate-y-2">
                        {event.periodText}
                      </div>
                    )}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white text-center drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tight transition-transform duration-500 group-hover:scale-105 z-10 break-words w-full px-4 line-clamp-3">
                      {event.title}
                    </h2>
                  </div>

                  <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 flex flex-col gap-3">
                    {event.descText && (
                      <div
                        className="text-white line-clamp-2 text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] [&_*]:!text-white [&>p]:inline [&>br]:hidden"
                        dangerouslySetInnerHTML={{ __html: event.descText }}
                      />
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {!event.isExternalLinkOnly && (
                        <Link href={`/${event.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white text-sm font-bold backdrop-blur-md transition-colors shadow-lg">
                          イベントページへ
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}

                      {event.officialUrl && (
                        <a href={event.officialUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${event.isExternalLinkOnly ? 'bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white' : 'bg-slate-800/60 hover:bg-slate-700/80 border border-slate-500/50 text-slate-200'} text-sm font-bold backdrop-blur-md transition-colors shadow-lg`}>
                          公式サイト
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <section id="event-calendar" className="scroll-mt-24">
          <div className="rounded-[2rem] overflow-hidden border border-cyan-100/60 shadow-[0_0_40px_rgba(14,165,233,0.18)] bg-gradient-to-b from-cyan-50/95 via-sky-50/95 to-emerald-50/95">
            <a
              href="#event-calendar"
              className="flex items-center justify-between gap-4 px-6 md:px-8 py-4 bg-gradient-to-r from-cyan-600 via-sky-500 to-emerald-400 text-white border-b border-white/25 hover:brightness-105 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/80">Event Calendar</span>
                <span className="text-lg md:text-xl font-black tracking-tight">イベントカレンダー</span>
              </div>
              <svg className="w-5 h-5 shrink-0 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="M5 12l7 7 7-7" />
              </svg>
            </a>
            <div className="bg-white/70 p-2 md:p-4">
              <p className="mb-3 rounded-2xl border border-cyan-100 bg-cyan-50/90 px-4 py-3 text-xs md:text-sm font-medium text-cyan-900 shadow-sm">
                ※ イベントカレンダーには、まだポータルに掲載していないイベント情報も含まれます。
              </p>
              <iframe
                src={eventCalendarUrl}
                width="100%"
                height="820"
                frameBorder="0"
                scrolling="no"
                style={{ border: 0, width: '100%', display: 'block' }}
                loading="lazy"
                title="イベントカレンダー"
              />
            </div>
          </div>
        </section>

        {portalArchiveUrl && (
          <a
            href={portalArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl opacity-85 hover:opacity-100 transition-all duration-500 group border border-slate-200 hover:border-fuchsia-400"
          >
            <Image
              src="https://aianonymous.vercel.app/images/hero-bg.jpg"
              alt="Archive"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/20 transition-opacity duration-300 group-hover:opacity-80" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
              <span className="text-fuchsia-400 font-bold tracking-widest text-sm mb-2 drop-shadow-md">ARCHIVE</span>
              <h2 className="text-xl md:text-3xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500">
                過去サイトへ
              </h2>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
