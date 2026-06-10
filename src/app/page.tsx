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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <p className="text-slate-500">現在公開されているイベントはありません。</p>
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/${event.slug}`}
                className="block p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300 group"
              >
                <h2 className="text-2xl font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h2>
                {event.description && (
                  <p className="text-slate-600 line-clamp-2">{event.description}</p>
                )}
                <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                  イベントページへ行く
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}

          {/* 現行サイト（第1回）への静的リンク */}
          <a
            href="https://aianonymous.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-fuchsia-400 transition-all duration-300 group"
          >
            <h2 className="text-2xl font-bold mb-2 text-slate-800 group-hover:text-fuchsia-600 transition-colors">
              第1回 AI-anonymous MUSIC FES (Archive)
            </h2>
            <p className="text-slate-600">
              2026年5月に開催された記念すべき第1回目の特設サイトはこちら。（外部サイトへ遷移します）
            </p>
            <div className="mt-4 text-fuchsia-600 text-sm font-medium flex items-center">
              アーカイブを見る
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
