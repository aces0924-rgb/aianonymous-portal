import prisma from '@/lib/prisma'
import TrackCard from '@/components/TrackCard'
import RandomTrackButton from '@/components/RandomTrackButton'
import HostSection from '@/components/HostSection'
import Image from 'next/image'
import Link from 'next/link'
import SelectionIndicator from '@/components/SelectionIndicator'
import TrackJumpModern from '@/components/TrackJumpModern'

import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

export async function generateMetadata({ params }: { params: Promise<{ eventSlug: string }> }) {
  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return { title: 'Not Found' };
  const labelConfig = JSON.parse(event.labelConfig || '{}');
  const siteTitle = labelConfig.siteTitle || 'AI-anonymous MUSIC FES.';
  return { title: siteTitle };
}

export default async function Home({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ preview?: string }> }) {
  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) notFound();
  const { preview } = await searchParams;
  
  const showUnpublished = preview === 'all';

  const getCachedEventTopData = unstable_cache(
    async (eventId: string, isHonban: boolean, showUnpublishedTracks: boolean) => {
      // 並列で設定やその他データを取得
      const [news, schedule, faqs, settings] = await Promise.all([
        prisma.news.findMany({ where: { eventId }, orderBy: { createdAt: 'desc' } }),
        prisma.schedule.findMany({ where: { eventId }, orderBy: { order: 'asc' } }),
        (prisma as any).faq.findMany({ where: { eventId }, orderBy: { order: 'asc' } }),
        (prisma as any).setting.findMany({ where: { eventId } })
      ]);
      
      const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value;
      const activeTable = isHonban ? 'track_honban' : (getSetting('ACTIVE_TRACK_TABLE') || "track");
      
      const tracksSelect = {
        id: true, entryNo: true, title: true, genre: true, songUrl: true, audioUrl: true, published: true, artistName: true, xAccount: true,
      };
      
      const whereClause = showUnpublishedTracks ? { eventId } : { eventId, published: true };
      
      const tracks = activeTable === "track_honban"
        ? await prisma.trackHonban.findMany({ where: whereClause, select: tracksSelect, orderBy: { entryNo: 'asc' } })
        : await prisma.track.findMany({ where: whereClause, select: tracksSelect, orderBy: { entryNo: 'asc' } });
        
      return {
        news,
        schedule,
        faqs,
        settings,
        activeTable,
        tracks,
        ctaMode: getSetting('CTA_BUTTON_MODE') || 'apply',
        voteUrl: getSetting('VOTE_URL') || "",
        playlistUrl: getSetting('YOUTUBE_PLAYLIST_URL') || "",
        shareBasePostUrl: getSetting('SHARE_BASE_POST_URL') || ""
      };
    },
    ['event-top-data'],
    { revalidate: 60 } // 60秒キャッシュ
  );

  const {
    news,
    schedule,
    faqs,
    activeTable,
    tracks,
    ctaMode,
    voteUrl,
    playlistUrl,
    shareBasePostUrl
  } = await getCachedEventTopData(event.id, preview === 'honban', showUnpublished);

  const themeConfig = JSON.parse(event.themeConfig || '{}')
  const featureFlags = JSON.parse(event.featureFlags || '{}')
  const labelConfig = JSON.parse(event.labelConfig || '{}')

  const defaultTheme = {
    mainColor: themeConfig.mainColor || '#00f0ff',
    bgUrl: themeConfig.bgUrl || '/images/hero-bg.jpg',
    bgPosition: themeConfig.bgPosition || '',
    logoUrl: themeConfig.logoUrl || '/images/logo.png',
    logoWidth: themeConfig.logoWidth || '',
    logoMarginTop: themeConfig.logoMarginTop || '',
    btnPrimaryColor: themeConfig.btnPrimaryColor || '',
    btnPrimaryTextColor: themeConfig.btnPrimaryTextColor || '#ffffff',
    btnSecondaryColor: themeConfig.btnSecondaryColor || '',
    btnSecondaryTextColor: themeConfig.btnSecondaryTextColor || '#ffffff',
    btnRandomColor: themeConfig.btnRandomColor || '',
    btnRandomTextColor: themeConfig.btnRandomTextColor || '#000000',
    btnXColor: themeConfig.btnXColor || '',
    btnXTextColor: themeConfig.btnXTextColor || '#000000',
    btnScheduleColor: themeConfig.btnScheduleColor || '',
    btnScheduleTextColor: themeConfig.btnScheduleTextColor || '#ffffff',
    btnOpacity: themeConfig.btnOpacity || ''
  }
  const defaultLabels = {
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
    guidelinesTitle: labelConfig.guidelinesTitle || '募集要項',
    randomPlayButtonLabel: labelConfig.randomPlayButtonLabel || 'ランダムで曲を聴く',
    scheduleButtonSubLabel: labelConfig.scheduleButtonSubLabel || 'イベント期間',
    scheduleButtonLabel: labelConfig.scheduleButtonLabel || 'YouTubeプレミア配信中！！',
    shareHashtag: labelConfig.shareHashtag || '#アノフェス'
  }
  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false,
    enableArtistMain: featureFlags.enableArtistMain ?? false,
    enableAwards: featureFlags.enableAwards ?? false,
    enableHostSection: featureFlags.enableHostSection ?? true,
    enableScheduleButton: featureFlags.enableScheduleButton ?? true,
    applicationFormType: featureFlags.applicationFormType || 'standard'
  }

  const isIllustrationMode = defaultFeatures.applicationFormType === 'illustration';

  const hosts = labelConfig.hosts || []

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[var(--color-cyan-400)] selection:text-white font-sans overflow-x-hidden">
      
      {/* Navigation Index (Fixed Header) */}
      <nav id="nav-index" className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center gap-2 md:gap-14">
          {/* Left: Logo Area (Spanning 3 rows) */}
          <div className="shrink-0 mb-1 md:mb-0">
            <Link href={`/${eventSlug}${preview === 'honban' ? '?preview=honban' : ''}`} className="block">
              <img 
                src={defaultTheme.logoUrl} 
                alt={defaultLabels.siteTitle} 
                className="h-10 md:h-32 w-auto hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_20px_var(--color-glow)]" 
                style={{ objectFit: 'contain' }} 
              />
            </Link>
          </div>

          {/* Right: Integrated 3-Row Grid (Wider for long track titles) */}
          <div className="flex-1 flex justify-start md:justify-start">
            <div className="grid grid-cols-4 gap-x-4 md:gap-x-16 gap-y-2 w-fit">
              {/* Row 1: Main Links */}
              {[
                { 
                  href: '#news', 
                  label: 'お知らせ', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                    </svg>
                  )
                },
                defaultFeatures.enableAwards ? { 
                  href: `/${eventSlug}/awards/preview`, 
                  label: 'AWARDS', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                  )
                } : null,
                { 
                  href: '#schedule', 
                  label: 'スケジュール', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                  )
                },
                { 
                  href: '#guidelines', 
                  label: (defaultLabels as any).guidelinesTitle || '募集要項', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
                    </svg>
                  )
                },
              ].filter(Boolean).map((item, idx) => item ? (
                <Link
                  key={idx}
                  href={item.href}
                  className="px-0.5 py-0.5 md:px-2 md:py-1 rounded-full text-sm md:text-xl font-black text-foreground hover: transition-all flex items-center justify-center md:justify-start gap-2 whitespace-nowrap group/link"
                >
                  <span className="shrink-0 transition-transform duration-300 group-hover/link:scale-110">{item.icon}</span>
                  <span className="hidden md:inline truncate">{item.label}</span>
                </Link>
              ) : null)}

              {/* Row 2: Secondary Links */}
              {[
                { 
                  href: '#faq', 
                  label: 'よくある質問', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>
                    </svg>
                  )
                },
                { 
                  href: `/${eventSlug}/tracks`, 
                  label: isIllustrationMode ? '参加イラスト' : '参加作品', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  )
                },
                { 
                  href: `/${eventSlug}/selections`, 
                  label: '推しリスト', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    </svg>
                  )
                },
                defaultFeatures.enableHostSection ? { 
                  href: '#host', 
                  label: '主催者', 
                  icon: (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )
                } : null,
              ].filter(Boolean).map((item: any, idx) => {
                const finalHref = preview === 'honban' 
                  ? `${item.href}${item.href.includes('?') ? '&' : '?'}preview=honban` 
                  : item.href;
                return (
                  <Link
                    key={idx}
                    href={finalHref}
                    className="px-0.5 py-0.5 md:px-2 md:py-1 rounded-full text-sm md:text-xl font-black text-foreground hover: transition-all flex items-center justify-center md:justify-start gap-2 whitespace-nowrap group/link"
                  >
                    <span className="shrink-0 transition-transform duration-300 group-hover/link:scale-110">{item.icon}</span>
                    <span className="hidden md:inline truncate">{item.label}</span>
                  </Link>
                );
              })}

              {/* Row 3: Full-width Dropdown spanning 4 columns */}
              <div className="col-span-4 mt-1">
                <TrackJumpModern preview={preview} tracks={tracks} enableShowCreators={defaultFeatures.enableShowCreators} enableArtistMain={defaultFeatures.enableArtistMain} eventSlug={eventSlug} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
        <section className="relative flex items-center justify-center min-h-screen overflow-hidden py-32" style={{ 
        backgroundImage: `url(${defaultTheme.bgUrl})`, 
        backgroundSize: 'cover', 
        backgroundPosition: defaultTheme.bgPosition || 'center 75%' 
      }}>
          <div className="absolute inset-0 bg-background/40 z-0"></div>
        
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #bc13fe 0%, transparent 50%)' }}></div>
        
        <div className="z-10 text-center space-y-4 md:space-y-6 px-4 w-full mt-28 md:mt-16">
          <div className="pb-6 flex flex-col items-center justify-center gap-6 md:gap-10 max-w-sm md:max-w-6xl mx-auto relative z-20">
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-4 md:gap-8 w-full">
              {/* CTA Button (Dynamic) */}
              {ctaMode !== 'hidden' && (
                <a 
                  href={ctaMode === 'vote' ? voteUrl : `/${eventSlug}/apply`} 
                  target={ctaMode === 'vote' ? "_blank" : undefined} 
                  rel={ctaMode === 'vote' ? "noopener noreferrer" : undefined} 
                    style={defaultTheme.btnPrimaryColor ? { backgroundColor: defaultTheme.btnPrimaryColor, color: defaultTheme.btnPrimaryTextColor, opacity: defaultTheme.btnOpacity || 1 } : { opacity: defaultTheme.btnOpacity || 1 }}
                  className={`w-full md:w-[420px] h-16 md:h-24 px-8 md:px-12 rounded-full ${
                    defaultTheme.btnPrimaryColor ? '' :
                    ctaMode === 'vote' 
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white' 
                      : 'bg-gradient-to-r from-[var(--color-cyan-400)] via-blue-600 to-purple-600 hover:from-[var(--color-cyan-400)] hover:to-purple-500 text-white'
                  } text-xl md:text-2xl font-black transition-all shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center justify-center gap-4 whitespace-nowrap group animate-pulse-slow [text-shadow:none]`}
                >
                  <svg className={`w-8 h-8 md:w-10 md:h-10 ${defaultTheme.btnPrimaryColor ? 'text-current' : 'text-foreground'} group-hover:rotate-12 transition-transform`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  <span className="tracking-tighter uppercase">
                    {ctaMode === 'vote' ? '投票する' : '応募する'}
                  </span>
                </a>
              )}

              {/* YouTube Button */}
              {!isIllustrationMode && playlistUrl && defaultFeatures.enablePlaylistInfo && (
                <a 
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                    style={defaultTheme.btnSecondaryColor ? { backgroundColor: defaultTheme.btnSecondaryColor, color: defaultTheme.btnSecondaryTextColor, opacity: defaultTheme.btnOpacity || 1 } : { opacity: defaultTheme.btnOpacity || 1 }}
                  className={`w-full md:w-[420px] h-16 md:h-24 px-8 md:px-12 rounded-full ${defaultTheme.btnSecondaryColor ? '' : 'bg-[var(--color-btn-secondary)] text-white'} hover:brightness-110 text-xl md:text-2xl font-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-4 border-2 border-white/20 whitespace-nowrap group [text-shadow:none]`}
                >
                  <svg className={`w-8 h-8 md:w-10 md:h-10 ${defaultTheme.btnSecondaryColor ? 'text-current' : 'text-foreground'} group-hover:scale-110 transition-transform`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                  </svg>
                  <span className="tracking-tighter">YouTube再生リスト</span>
                </a>
              )}

              {/* Random Button */}
              {!isIllustrationMode && defaultFeatures.enableRandomPlay && (
                <RandomTrackButton 
                  trackIds={tracks.map((t: any) => t.id)} 
                  preview={preview} 
                  variant="hero" 
                  label={defaultLabels.randomPlayButtonLabel} 
                  style={defaultTheme.btnRandomColor ? { backgroundColor: defaultTheme.btnRandomColor, color: defaultTheme.btnRandomTextColor, opacity: defaultTheme.btnOpacity || 1 } : { opacity: defaultTheme.btnOpacity || 1 }}
                />
              )}

              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`【${defaultLabels.siteTitle}】\n素晴らしい音楽祭を応援しています！\n\nhttps://aianonymous.vercel.app/${event.slug}\n\n${defaultLabels.shareHashtag}${shareBasePostUrl ? `\n\n${shareBasePostUrl}` : ''}`)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                  style={defaultTheme.btnXColor ? { backgroundColor: defaultTheme.btnXColor, color: defaultTheme.btnXTextColor, opacity: defaultTheme.btnOpacity || 1 } : { opacity: defaultTheme.btnOpacity || 1 }}
                className={`w-full md:w-[420px] h-16 md:h-24 px-8 md:px-12 rounded-full ${defaultTheme.btnXColor ? '' : 'bg-white hover:bg-gray-100 text-foreground'} text-xl md:text-2xl font-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-4 whitespace-nowrap group [text-shadow:none]`}
              >
                <svg className={`w-8 h-8 md:w-10 md:h-10 ${defaultTheme.btnXColor ? 'text-current' : 'text-foreground'} group-hover:rotate-12 transition-transform`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="tracking-tight uppercase font-black text-sm md:text-xl">Xでイベントを応援</span>
              </a>

              {defaultFeatures.enableScheduleButton !== false && (
                <Link 
                  href={`/${eventSlug}/schedule`}
                  style={defaultTheme.btnScheduleColor ? { backgroundColor: defaultTheme.btnScheduleColor, color: defaultTheme.btnScheduleTextColor, opacity: defaultTheme.btnOpacity || 1 } : { opacity: defaultTheme.btnOpacity || 1 }}
                  className={`w-full md:w-[420px] h-16 md:h-24 px-8 md:px-12 rounded-full ${defaultTheme.btnScheduleColor ? '' : 'bg-[var(--color-cyan-500)] hover:bg-[var(--color-cyan-400)] text-white'} font-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-4 whitespace-nowrap group [text-shadow:none]`}
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-current transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                  </svg>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] md:text-xs  font-bold tracking-[0.2em] mb-1">{defaultLabels.scheduleButtonSubLabel}</span>
                    <span className="text-sm md:text-xl font-black tracking-tighter">{defaultLabels.scheduleButtonLabel}</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
          <div 
            className={`relative inline-block group z-10 w-full ${defaultTheme.logoMarginTop !== '' ? '' : '-mt-24 md:-mt-48 lg:-mt-64'}`}
            style={defaultTheme.logoMarginTop !== '' ? { marginTop: `${defaultTheme.logoMarginTop}px` } : {}}
          >
            <img src={defaultTheme.logoUrl} alt={defaultLabels.siteTitle} className="w-full h-auto mx-auto drop-shadow-[0_0_80px_rgba(188,19,254,0.6)] transition-all duration-700 group-hover:drop-shadow-[0_0_120px_var(--color-glow)] group-hover:scale-[1.08]" style={{ mixBlendMode: 'screen', objectFit: 'contain', maxWidth: defaultTheme.logoWidth ? `${defaultTheme.logoWidth}px` : '2400px' }} />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-20 space-y-40">
        
        {/* News Section */}
        <section id="news" className="space-y-8 scroll-mt-20">
          <h2 className="text-4xl font-black tracking-tight border-l-4 border-[var(--color-cyan-400)] pl-4 text-foreground">NEWS</h2>
          <div className="bg-surface/50 backdrop-blur-sm border border-surface-border rounded-3xl p-8 shadow-2xl">
            {news.length === 0 ? (
              <p className="text-foreground italic">現在お知らせはありません。</p>
            ) : (
              <ul className="space-y-6">
                {news.map((n: any) => (
                  <li key={n.id} className="border-b border-surface-border pb-6 last:border-0 last:pb-0">
                    <span className="text-sm text-[var(--color-cyan-400)] font-mono block mb-2">
                      {(() => {
                        const date = new Date(n.createdAt);
                        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                      })()}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{n.title}</h3>
                    {n.content && <p className="text-foreground mt-3 leading-relaxed font-light">{n.content}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="space-y-16 scroll-mt-20">
          <h2 className="text-4xl font-black tracking-tight border-l-4 border-[var(--color-cyan-400)] pl-4 text-foreground">SCHEDULE</h2>
          
          <div className="relative">
            {/* Central Line (Desktop) */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-cyan-400)] via-[var(--color-cyan-500)] to-[var(--color-cyan-600)] shadow-[0_0_15px_var(--color-glow)] "></div>

            <div className="space-y-16">
              {schedule.length === 0 ? (
                <p className="text-foreground pl-12 md:text-center md:pl-0 italic">スケジュールは後日発表されます。</p>
              ) : (
                schedule.map((s: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  const dateColorClasses = 'text-foreground';
                  const ringColorClasses = isEven ? 'border-[var(--color-cyan-400)] shadow-[0_0_10px_#bc13fe]' : 'border-[var(--color-cyan-400)] shadow-[0_0_10px_var(--color-glow)]';

                  return (
                    <div key={s.id} className={`relative flex items-center justify-between w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                      <div className="hidden md:block w-5/12"></div>
                      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-20 flex items-center justify-center">
                        <div className={`w-4 h-4 border-2 rounded-full bg-background ${ringColorClasses}`}></div>
                      </div>
                      <div className="w-full pl-12 md:pl-0 md:w-5/12 group">
                        <div className={`mb-2 font-black text-xl font-sans tracking-normal ${dateColorClasses} ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                          {s.date}
                        </div>
                        <div className={`bg-surface/90 backdrop-blur-md border border-surface-border p-6 rounded-3xl shadow-xl transition-all group-hover:border-gray-500 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                          <p className="text-foreground font-bold text-lg leading-snug">{s.title}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Guidelines Section */}
        <section id="guidelines" className="space-y-16 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
            <h2 className="text-4xl font-black tracking-tight border-l-4 border-[var(--color-cyan-400)] pl-4 text-foreground">
              GUIDELINES
            </h2>
            <span className="text-foreground font-mono text-sm tracking-widest">/ {(defaultLabels as any).guidelinesTitle || '募集要項'}</span>
          </div>
          

          {/* Rule Cards Vertical List */}
          <div className="space-y-16 pt-10 px-2 lg:px-0">
            
            
            {/* 募集要項 (統合版) */}
            {event.description && (
              <div className="group relative">
                <div className="relative bg-gradient-to-br from-surface via-background to-surface border border-surface-border p-8 md:p-14 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all group-hover:border-surface-border">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-cyan-400)] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="relative z-10 space-y-12">
                    <h2 className="text-3xl md:text-5xl font-black mb-8 text-center tracking-tighter text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{(defaultLabels as any).guidelinesTitle || '募集要項'}</h2>
                    
                    {event.description && (
                      <div className="prose prose-p:text-foreground prose-headings:text-foreground prose-a:text-[var(--color-cyan-400)] prose-li:text-foreground prose-strong:text-foreground max-w-none px-0 custom-quill-content">
                        <div dangerouslySetInnerHTML={{ __html: event.description }} />
                      </div>
                    )}
                    
                                      </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Schedule Section */}
          <section id="faq" className="space-y-8 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
              <h2 className="text-4xl font-black tracking-tight border-l-4 border-[var(--color-cyan-400)] pl-4 text-foreground uppercase">
                FAQ
              </h2>
              <span className="text-foreground font-mono text-sm tracking-widest">/ よくある質問</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {faqs.map((faq: any, index: number) => (
                <div key={index} className="group relative bg-surface/40 backdrop-blur-sm border border-surface-border rounded-3xl p-5 md:p-8 hover:border-[var(--color-cyan-400)] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                    <span className="text-xl md:text-2xl font-black text-[var(--color-cyan-400)] shrink-0 leading-none">Q.</span>
                    <div className="space-y-4 flex-1">
                      <h3 className="text-base md:text-xl font-black text-foreground leading-tight break-words">
                        {faq.question}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-2 border-t border-surface-border/50">
                        <span className="text-xl md:text-2xl font-black text-[var(--color-cyan-400)] shrink-0 leading-none">A.</span>
                        <p className="text-foreground text-sm md:text-lg font-light leading-relaxed whitespace-pre-wrap break-words">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        {/* Host Section */}
        {defaultFeatures.enableHostSection && (
          <HostSection hosts={hosts} />
        )}

      </div>

      <footer className="border-t border-surface-border bg-background py-24 mt-40 text-center text-foreground">
        <div className="max-w-4xl mx-auto px-6 space-y-10 text-center">
          <div className="flex justify-center mb-8">
            <img src={defaultTheme.logoUrl} alt="Logo" className="w-32  grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" style={{ mixBlendMode: 'screen', objectFit: 'contain' }} />
          </div>
          <div className="space-y-3 ">
            <p className="text-[10px] tracking-[0.4em] font-light">© {new Date().getFullYear()} {defaultLabels.siteTitle}</p>
            <p className="text-[9px] tracking-tighter uppercase font-bold text-[var(--color-cyan-400)]">Powered by Portal System</p>
          </div>
        </div>
      </footer>

      {/* Selection UI */}
      <SelectionIndicator applicationFormType={defaultFeatures.applicationFormType} />
    </main>
  )
}
