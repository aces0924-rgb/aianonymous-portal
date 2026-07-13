import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function PortalHome() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  const globalSettings = await prisma.globalSetting.findMany();
  const settingsMap = globalSettings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  const portalBgUrl = settingsMap['portal_bg_url'] || "https://i.gyazo.com/3d88429640b885cb595bc0c3756007d6.jpg";
  const portalLogoUrl = settingsMap['portal_logo_url'] || "https://i.gyazo.com/2d95ce2d1f241232b192d53bc4dd4fd4.png";
  const portalLogoWidth = settingsMap['portal_logo_width'];
  const portalArchiveUrl = settingsMap['portal_archive_url'] ?? "https://aianonymous.vercel.app/";

  return (
    <main className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      {/* 背景画像 (等倍表示) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image 
          src={portalBgUrl} 
          alt="Portal Background" 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'center' }} 
          priority 
        />
      </div>
      {/* すりガラス風の明るめレイヤー (うっすら白みがかった半透明 + 弱めのぼかし) */}
      <div className="fixed inset-0 z-0 bg-white/10 backdrop-blur-[3px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto pt-8 pb-16 px-4">
        <div className="flex justify-center mb-10">
          <div className="relative px-6 py-3 md:px-10 md:py-5 rounded-[2.5rem] bg-slate-900/50 backdrop-blur-lg border border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex justify-center items-center group overflow-hidden">
            {/* パネル内側の微かなグラデーション */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-cyan-500/10 via-transparent to-fuchsia-500/10 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
                <img 
                  src={portalLogoUrl} 
                  alt="AI音楽イベントフェスポータル" 
                  style={portalLogoWidth ? { width: `${portalLogoWidth}px`, maxWidth: '100%' } : undefined}
                  className={`relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-transform duration-500 group-hover:scale-105 ${!portalLogoWidth ? 'w-full max-w-xs md:max-w-sm' : ''}`}
                />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <a
            href="#event-calendar"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black text-white border border-white/20 shadow-[0_0_24px_rgba(0,0,0,0.45)] hover:bg-zinc-900 hover:border-white/30 transition-all font-black tracking-widest"
          >
            <span className="text-sm md:text-base">イベントカレンダーへ</span>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.length === 0 ? (
            <p className="text-slate-300">現在公開されているイベントはありません。</p>
          ) : (
            events.map((event) => {
              const theme = JSON.parse(event.themeConfig || '{}');
              const labels = JSON.parse(event.labelConfig || '{}');
              const features = JSON.parse(event.featureFlags || '{}');
              const bgUrl = theme.bgUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80';
              const logoUrl = theme.logoUrl;
              
              const periodText = labels.portalPeriod || '';
              const descText = labels.portalDescription || event.description || '';
              const officialUrl = labels.portalOfficialUrl || '';
              const isExternalLinkOnly = features.isExternalLinkOnly === true;
              const cardTargetUrl = isExternalLinkOnly && officialUrl ? officialUrl : `/${event.slug}`;
              
              return (
              <div
                key={event.id}
                className="relative block aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl opacity-85 hover:opacity-100 transition-all duration-500 group border border-slate-200 hover:border-cyan-400"
              >
                {/* カード全体をクリック可能にするメインリンク */}
                {isExternalLinkOnly && officialUrl ? (
                  <a href={cardTargetUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={event.title} />
                ) : (
                  <Link href={cardTargetUrl} className="absolute inset-0 z-10" aria-label={event.title} />
                )}
                {/* 背景画像 */}
                <Image 
                  src={bgUrl} 
                  alt="" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* オーバーレイ (暗くしてテキストを目立たせる) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
                
                {/* コンテンツ */}
                <div className="absolute inset-0 p-8 flex flex-col">
                  {/* 中央のテキスト */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {periodText && (
                      <div className="mb-4 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 text-[10px] md:text-xs font-black tracking-widest backdrop-blur-md shadow-lg transition-transform duration-500 group-hover:-translate-y-2">
                        {periodText}
                      </div>
                    )}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white text-center drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tight transition-transform duration-500 group-hover:scale-105 z-10 break-words w-full px-4 line-clamp-3">
                      {event.title}
                    </h2>
                  </div>
                  
                  {/* 下部の情報 (ボタングループ等は z-20 にして押せるようにする) */}
                  <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 flex flex-col gap-3">
                    {descText && (
                      <div 
                        className="text-white line-clamp-2 text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] [&_*]:!text-white [&>p]:inline [&>br]:hidden"
                        dangerouslySetInnerHTML={{ __html: descText }}
                      />
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* メインのイベントページボタン */}
                      {!isExternalLinkOnly && (
                        <Link href={`/${event.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white text-sm font-bold backdrop-blur-md transition-colors shadow-lg">
                          イベントページへ
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                      
                      {/* 公式サイトボタン (あれば表示) */}
                      {officialUrl && (
                        <a href={officialUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isExternalLinkOnly ? 'bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white' : 'bg-slate-800/60 hover:bg-slate-700/80 border border-slate-500/50 text-slate-200'} text-sm font-bold backdrop-blur-md transition-colors shadow-lg`}>
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
            )})
          )}

          <section id="event-calendar" className="md:col-span-2 scroll-mt-24">
            <div className="rounded-[2rem] overflow-hidden border border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.45)] bg-black">
              <a
                href="#event-calendar"
                className="flex items-center justify-between gap-4 px-6 md:px-8 py-4 bg-black text-white border-b border-white/10 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/70">Event Calendar</span>
                  <span className="text-lg md:text-xl font-black tracking-tight">イベントカレンダー</span>
                </div>
                <svg className="w-5 h-5 shrink-0 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12l7 7 7-7" />
                </svg>
              </a>
              <div className="bg-zinc-950 p-2 md:p-4">
                <iframe
                  src="https://script.google.com/macros/s/AKfycbxEFXYDzYnK9T8AOwWISFoBfXcTYLz2WuKdBTjQ1hW_DLvawgLub6_YG-yoezmCCcuibw/exec"
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

          {/* 現行サイト（第1回）への静的リンク */}
          {portalArchiveUrl && (
            <a
              href={portalArchiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl opacity-85 hover:opacity-100 transition-all duration-500 group border border-slate-200 hover:border-fuchsia-400"
            >
              <img 
                src="https://aianonymous.vercel.app/images/hero-bg.jpg" 
                alt="Archive" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/20 transition-opacity duration-300 group-hover:opacity-80" />
              <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
                <span className="text-fuchsia-400 font-bold tracking-widest text-sm mb-2 drop-shadow-md">ARCHIVE</span>
                <h2 className="text-xl md:text-3xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500">
                  第1回AIアノニマスミュージックフェス
                </h2>
              </div>
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
