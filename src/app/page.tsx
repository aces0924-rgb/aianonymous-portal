import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function PortalHome() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      {/* 背景画像 (透明度50%) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://i.gyazo.com/3d88429640b885cb595bc0c3756007d6.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5
        }}
      />
      {/* 背景のグラデーションオーバーレイ */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto py-16 px-4">
        <div className="flex justify-center mb-12">
          <img 
            src="https://i.gyazo.com/11203a829d5d0f947da8831f7c451b00.png" 
            alt="AI音楽イベントフェスポータル" 
            className="w-full max-w-xl md:max-w-3xl drop-shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.length === 0 ? (
            <p className="text-slate-300">現在公開されているイベントはありません。</p>
          ) : (
            events.map((event) => {
              const theme = JSON.parse(event.themeConfig || '{}');
              const labels = JSON.parse(event.labelConfig || '{}');
              const bgUrl = theme.bgUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80';
              const logoUrl = theme.logoUrl;
              
              const periodText = labels.portalPeriod || '';
              const descText = labels.portalDescription || event.description || '';
              const officialUrl = labels.portalOfficialUrl || '';
              
              return (
              <div
                key={event.id}
                className="relative block aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-slate-200 hover:border-cyan-400"
              >
                {/* カード全体をクリック可能にするメインリンク */}
                <Link href={`/${event.slug}`} className="absolute inset-0 z-10" aria-label={event.title} />
                {/* 背景画像 */}
                <img 
                  src={bgUrl} 
                  alt="" 
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
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tight transition-transform duration-500 group-hover:scale-105 z-10 break-words w-full px-4 line-clamp-3">
                      {event.title}
                    </h2>
                  </div>
                  
                  {/* 下部の情報 (ボタングループ等は z-20 にして押せるようにする) */}
                  <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 flex flex-col gap-3">
                    {descText && (
                      <p className="text-slate-200 line-clamp-2 text-sm font-medium drop-shadow-md">
                        {descText}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* メインのイベントページボタン */}
                      <Link href={`/${event.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white text-sm font-bold backdrop-blur-md transition-colors shadow-lg">
                        イベントページへ
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      
                      {/* 公式サイトボタン (あれば表示) */}
                      {officialUrl && (
                        <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-500/50 text-slate-200 text-sm font-bold backdrop-blur-md transition-colors shadow-lg">
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

          {/* 現行サイト（第1回）への静的リンク */}
          <a
              href="https://aianonymous.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-slate-200 hover:border-fuchsia-400"
            >
              <img 
                src="https://aianonymous.vercel.app/images/hero-bg.jpg" 
                alt="Archive" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/20 transition-opacity duration-300 group-hover:opacity-80" />
            
            <div className="absolute inset-0 p-8 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] break-words w-full px-4">
                  第1回 AI-anonymous <br/> MUSIC FES
                </h2>
                <span className="mt-4 px-3 py-1 rounded-full bg-fuchsia-600 text-white text-xs font-bold uppercase tracking-widest">Archive</span>
              </div>
              
              <div className="relative z-20 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 flex flex-col gap-3">
                <p className="text-slate-200 line-clamp-1 text-sm font-medium drop-shadow-md">
                  2026年5月に開催された記念すべき第1回目の特設サイトはこちら。（外部サイトへ遷移します）
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/30 border border-fuchsia-400/50 text-fuchsia-100 text-sm font-bold backdrop-blur-md">
                    アーカイブを見る
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
