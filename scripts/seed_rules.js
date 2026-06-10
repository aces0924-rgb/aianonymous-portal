const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findFirst();
  if (!event) return;

  await prisma.rule.createMany({
    data: [
      {
        eventId: event.id,
        order: 1,
        title: 'フェスコンセプト',
        icon: '✨',
        content: '<p>本イベントは、全楽曲を<strong class="text-[var(--color-cyan-400)] font-bold underline decoration-[var(--color-glow)]/50 decoration-8 underline-offset-4">「完全制作者匿名」</strong>で公開する、実験的なオンライン音楽フェスです。</p><br/><p>投稿された楽曲と歌詞は、AIがその魂を読み解き、独自の世界観を反映した<strong class="text-[var(--color-cyan-400)] font-bold">「多角的な考察レビュー」</strong>や、曲の世界に没入させる<strong class="text-[var(--color-cyan-400)] font-bold">「字幕付き背景動画」</strong>を生成。名前というフィルターを外し、音楽そのものの輝きを届けます。</p>'
      },
      {
        eventId: event.id,
        order: 2,
        title: '応募資格・条件',
        icon: '🎧',
        content: '<ul class="list-disc pl-6 space-y-4"><li><strong>オリジナル楽曲であること</strong>（既存曲のカバーやリミックスは不可）</li><li><strong>過去に公開済みの楽曲でもOK！</strong>（ただし、本フェスでは別名義・匿名として扱われます）</li><li><strong>ボーカルの有無は問いません</strong>（ボカロ、生歌、インスト、すべて大歓迎）</li><li><strong>一人何曲でも応募可能</strong>です！</li></ul>'
      },
      {
        eventId: event.id,
        order: 3,
        title: '参加方法・スケジュール',
        icon: '📅',
        content: '<div class="space-y-4"><div class="flex items-start gap-4"><div class="w-10 h-10 rounded-full bg-[var(--color-cyan-400)]/20 text-[var(--color-cyan-400)] flex items-center justify-center font-bold shrink-0">1</div><div><strong>楽曲エントリー</strong><p class="text-sm opacity-80 mt-1">2026年6月1日 〜 6月30日（期間中いつでも応募フォームから提出可能）</p></div></div><div class="flex items-start gap-4"><div class="w-10 h-10 rounded-full bg-[var(--color-cyan-400)]/20 text-[var(--color-cyan-400)] flex items-center justify-center font-bold shrink-0">2</div><div><strong>AIによる自動生成プロセス</strong><p class="text-sm opacity-80 mt-1">提出後、順次AIが動画とレビューを生成（約1〜2日程度）</p></div></div><div class="flex items-start gap-4"><div class="w-10 h-10 rounded-full bg-[var(--color-cyan-400)]/20 text-[var(--color-cyan-400)] flex items-center justify-center font-bold shrink-0">3</div><div><strong>フェス本番・全曲公開！</strong><p class="text-sm opacity-80 mt-1">2026年7月15日 20:00 〜 YouTubeプレミア公開 ＆ サイト解禁</p></div></div></div>'
      }
    ]
  });
  console.log('Inserted default rules into DB');
}

main().finally(() => prisma.$disconnect());
