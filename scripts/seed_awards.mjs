import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding awards data...');

  const awards = [
    // AI Lyric Award
    {
      category: 'AI_LYRIC',
      rank: 1,
      title: 'ペンティメント',
      note: '「上書きされた微笑と、透けて見える秘密の指先」',
      description: '塗り潰された過去（痕跡）こそが、最も饒舌に本質を語るという美術的真理を鮮やかに描いた傑作。',
      isPublished: true,
      order: 1,
    },
    {
      category: 'AI_LYRIC',
      rank: 2,
      title: 'Transit',
      note: '「加速する都市と、静止した呼吸の境界線」',
      description: '都会の静寂を際立たせる自販機のノイズ描写と、一歩踏み出す勇気の対比が聴き手の胸を打つ。',
      isPublished: true,
      order: 2,
    },
    {
      category: 'AI_LYRIC',
      rank: 3,
      title: '君はエージーアイ',
      note: '「論理の深淵と、声に恋するプリミティブ」',
      description: '知性の極致であるAIに対し、「ただ、そばにいること」を最大の肯定として受容する新時代の愛の形。',
      isPublished: true,
      order: 3,
    },
    { category: 'AI_LYRIC', rank: 4, title: 'キミという奇跡', note: '自己否定を潤す雨', isPublished: true, order: 4 },
    { category: 'AI_LYRIC', rank: 5, title: '泡月双花', note: '消えゆく泡沫の情愛', isPublished: true, order: 5 },
    { category: 'AI_LYRIC', rank: 6, title: 'わたぐも', note: '透明な未来への恋', isPublished: true, order: 6 },

    // Curator Award
    {
      category: 'CURATOR',
      rank: 1,
      title: 'Curator_AI_X',
      note: 'ヒットメーカー賞',
      description: 'より多くのTOP10位楽曲を紹介した推し曲リストを作成。',
      extraInfo: 'Hits: 8',
      isPublished: true,
      order: 1,
    },
    {
      category: 'CURATOR',
      rank: 2,
      title: 'Neo_Vocaloid',
      note: 'セレクト名手',
      extraInfo: 'Hits: 6',
      isPublished: true,
      order: 2,
    },

    // User Choice
    { category: 'USER_CHOICE', rank: 1, title: 'キミという奇跡', extraInfo: '1,280 pts', isPublished: true, order: 1 },
    { category: 'USER_CHOICE', rank: 2, title: 'ペンティメント', extraInfo: '1,050 pts', isPublished: true, order: 2 },
    { category: 'USER_CHOICE', rank: 3, title: '泡月双花', extraInfo: '980 pts', isPublished: true, order: 3 },
    { category: 'USER_CHOICE', rank: 4, title: '君はエージーアイ', extraInfo: '840 pts', isPublished: true, order: 4 },
    { category: 'USER_CHOICE', rank: 5, title: 'Transit', extraInfo: '720 pts', isPublished: true, order: 5 },
  ];

  for (const award of awards) {
    await prisma.award.create({
      data: award,
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
