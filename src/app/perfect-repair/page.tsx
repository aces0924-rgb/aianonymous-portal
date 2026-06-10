import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PerfectRepairPage() {
  const prisma = new PrismaClient();
  
  try {
    // 全ての日程を本番通りの JST 22:00 (UTC 13:00) にリセット
    const baseDate = new Date('2026-05-10T13:00:00Z'); // 5/10 22:00 JST (ダミー開始点)

    const correctSchedule = [
      { day: 0, date: '2026-05-10T13:00:00Z', trackRange: '前夜祭', trackCount: 0, remarks: '前夜祭特別放送' },
      { day: 1, date: '2026-05-11T13:00:00Z', trackRange: 'No.001 〜 No.014', trackCount: 14, remarks: '' },
      { day: 2, date: '2026-05-12T13:00:00Z', trackRange: 'No.015 〜 No.028', trackCount: 14, remarks: '' },
      { day: 3, date: '2026-05-13T13:00:00Z', trackRange: 'No.029 〜 No.042', trackCount: 14, remarks: '' },
      { day: 4, date: '2026-05-14T13:00:00Z', trackRange: 'No.043 〜 No.056', trackCount: 14, remarks: '' },
      { day: 5, date: '2026-05-15T13:00:00Z', trackRange: 'No.057 〜 No.070', trackCount: 14, remarks: '' },
      { day: 6, date: '2026-05-16T13:00:00Z', trackRange: 'No.071 〜 No.084', trackCount: 14, remarks: '' },
      { day: 7, date: '2026-05-17T13:00:00Z', trackRange: 'No.085 〜 No.098', trackCount: 14, remarks: '' },
      { day: 8, date: '2026-05-18T13:00:00Z', trackRange: 'No.099 〜 No.112', trackCount: 14, remarks: '' },
      { day: 9, date: '2026-05-19T13:00:00Z', trackRange: 'No.113 〜 No.126', trackCount: 14, remarks: '' },
      { day: 10, date: '2026-05-20T13:00:00Z', trackRange: 'No.127 〜 No.140', trackCount: 14, remarks: '' },
      { day: 11, date: '2026-05-21T13:00:00Z', trackRange: 'No.141 〜 No.154', trackCount: 14, remarks: '' },
      { day: 12, date: '2026-05-22T13:00:00Z', trackRange: 'No.155 〜 No.168', trackCount: 14, remarks: '' },
      { day: 13, date: '2026-05-23T13:00:00Z', trackRange: 'No.169 〜 No.182', trackCount: 14, remarks: '' },
      { day: 14, date: '2026-05-24T13:00:00Z', trackRange: 'No.183 〜 No.196', trackCount: 14, remarks: '' },
      { day: 15, date: '2026-05-25T13:00:00Z', trackRange: 'No.197 〜 No.210', trackCount: 14, remarks: '' },
      { day: 16, date: '2026-05-26T13:00:00Z', trackRange: '結果発表', trackCount: 0, remarks: '最終結果発表特番' },
    ];

    for (const item of correctSchedule) {
      await prisma.premiereSchedule.upsert({
        where: { day: item.day },
        update: {
          date: new Date(item.date),
          trackRange: item.trackRange,
          trackCount: item.trackCount,
          remarks: item.remarks,
          isPublic: true,
        },
        create: {
          day: item.day,
          date: new Date(item.date),
          trackRange: item.trackRange,
          trackCount: item.trackCount,
          remarks: item.remarks,
          isPublic: true,
          youtubeUrl: ""
        }
      });
    }
    
    return (
      <div className="p-10 bg-background text-foreground min-h-screen font-sans">
        <h1 className="text-4xl font-bold text-[var(--color-cyan-400)] mb-6">✨ スケジュール完全修復完了</h1>
        <p className="text-xl mb-4">全17日程（Day 0〜16）を本番データの正しい日時にリセットしました。</p>
        <ul className="mb-8 text-gray-400 space-y-1">
          <li>Day 1: 5/11 22:00</li>
          <li>Day 2: 5/12 22:00</li>
          <li>Day 3: 5/13 22:00 (本日)</li>
        </ul>
        <Link href="/schedule" className="px-6 py-3 bg-[var(--color-cyan-500)] text-black font-bold rounded-lg hover:bg-[var(--color-cyan-500)] transition-colors">
          スケジュールを確認する
        </Link>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-10 bg-background text-foreground min-h-screen">
        <h1 className="text-4xl font-bold text-red-500 mb-6">❌ 修復中にエラーが発生しました</h1>
        <pre className="p-4 bg-surface rounded">{error.message}</pre>
      </div>
    );
  }
}
