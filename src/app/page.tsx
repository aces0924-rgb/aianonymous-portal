import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function PortalHome() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-cyan-600)] to-[var(--color-cyan-400)] tracking-tight">
          AI音楽イベントフェスポータル
        </h1>
        <p className="text-slate-500 mb-12 text-lg">
          AI音楽イベントのポータルサイトです。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.length === 0 ? (
            <p className="text-slate-500">現在公開されているイベントはありません。</p>
          ) : (
            events.map((event) => {
              const theme = JSON.parse(event.themeConfig || '{}');
              const bgUrl = theme.bgUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80';
              const logoUrl = theme.logoUrl;
              
              return (
              <Link
                key={event.id}
                href={`/${event.slug}`}
                className="relative block aspect-[16/9] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-slate-200 hover:border-cyan-400"
              >
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
                    <h2 className="text-3xl md:text-5xl font-black text-white text-center drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tight transition-transform duration-500 group-hover:scale-105">
                      {event.title}
                    </h2>
                  </div>
                  
                  {/* 下部の情報 */}
                  <div className="mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {event.description && (
                      <p className="text-slate-300 line-clamp-2 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        {event.description}
                      </p>
                    )}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-sm font-bold backdrop-blur-md">
                      イベントページへ行く
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )})
          )}

          {/* 現行サイト（第1回）への静的リンク */}
          <a
            href="https://aianonymous.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-[16/9] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-slate-200 hover:border-fuchsia-400"
          >
            {/* 背景画像 */}
            <img 
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80" 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/20 transition-opacity duration-300 group-hover:opacity-80" />
            
            <div className="absolute inset-0 p-8 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-3xl md:text-4xl font-black text-white text-center drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                  第1回 AI-anonymous <br/> MUSIC FES
                </h2>
                <span className="mt-4 px-3 py-1 rounded-full bg-fuchsia-600 text-white text-xs font-bold uppercase tracking-widest">Archive</span>
              </div>
              
              <div className="mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-slate-300 line-clamp-1 text-sm mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  2026年5月に開催された記念すべき第1回目の特設サイトはこちら。（外部サイトへ遷移します）
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-300 text-sm font-bold backdrop-blur-md">
                  アーカイブを見る
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
