import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { toggleAwardPublication } from '../actions';

async function ToggleButton({ id, isPublished }: { id: number, isPublished: boolean }) {
  'use server';
  return (
    <form action={async () => {
      'use server';
      await toggleAwardPublication(id, !isPublished);
    }}>
      <button
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
          isPublished 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-gray-700 text-foreground hover:bg-gray-600'
        }`}
      >
        {isPublished ? '● 公開中' : '○ 非公開'}
      </button>
    </form>
  );
}

export default async function AdminAwardsPage() {
  const awards = await prisma.award.findMany({
    orderBy: [
      { category: 'asc' },
      { order: 'asc' },
      { rank: 'asc' }
    ]
  });

  const categories = {
    AI_LYRIC: 'AI分析部門',
    CURATOR: 'キュレーター部門',
    USER_CHOICE: '総合投票部門',
    CREATORS_CHOICE: 'クリエイターチョイス（スピンオフ部門）'
  };

  const groupedAwards = awards.reduce((acc, award) => {
    const cat = award.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(award);
    return acc;
  }, {} as Record<string, typeof awards>);

  return (
    <div className="min-h-screen bg-surface text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="flex items-center justify-between border-b border-surface-border pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">アワード管理</h1>
            <p className="text-sm text-foreground mt-1">表彰結果の公開・非公開および内容の確認</p>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/awards/preview" 
              target="_blank"
              className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-yellow-400 transition-all flex items-center gap-2"
            >
              <span>👁</span> プレビューを確認
            </Link>
            <Link href="/admin" className="text-sm text-foreground hover:text-foreground transition-colors">
              ← ダッシュボードへ戻る
            </Link>
          </div>
        </header>

        <div className="grid gap-12 text-foreground">
          {Object.entries(categories).map(([key, label]) => (
            <section key={key} className="space-y-4">
              <h2 className="text-xl font-bold border-l-4 border-yellow-500 pl-4">{label}</h2>
              <div className="bg-gray-800 rounded-3xl overflow-hidden border border-surface-border text-foreground">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface/50 text-foreground text-xs uppercase tracking-widest border-b border-surface-border">
                      <th className="px-6 py-4 font-bold">順位</th>
                      <th className="px-6 py-4 font-bold">タイトル / 受賞者</th>
                      <th className="px-6 py-4 font-bold max-w-xs">内容の概要</th>
                      <th className="px-6 py-4 font-bold text-right">公開設定</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {(groupedAwards[key] || []).map((award) => (
                      <tr key={award.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`font-mono text-lg font-black ${award.rank <= 3 && key !== 'CURATOR' ? 'text-yellow-500' : 'text-foreground'}`}>
                            {key === 'CURATOR' ? '-' : award.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold">{award.title}</p>
                          <p className="text-[10px] text-foreground truncate max-w-[150px]">{award.note}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-foreground line-clamp-2 max-w-md italic">
                            {award.description || award.extraInfo || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ToggleButton id={award.id} isPublished={award.isPublished} />
                        </td>
                      </tr>
                    ))}
                    {(!groupedAwards[key] || groupedAwards[key].length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-foreground italic">
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-6">
          <h3 className="text-yellow-500 font-bold mb-2 flex items-center gap-2 text-foreground">
            <span>💡</span> ヒント
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            現在、 `/awards` ページは「Coming Soon」に固定されています。<br/>
            表示内容の確認は、右上の「プレビューを確認」から行ってください。
          </p>
        </div>
      </div>
    </div>
  );
}
