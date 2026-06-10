import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getRanking() {
  try {
    const votes = await prisma.vote.groupBy({
      by: ['targetContent'],
      _count: {
        targetContent: true,
      },
      orderBy: {
        _count: {
          targetContent: 'desc',
        },
      },
    });

    console.log('\n--- 投票集計ランキング (TOP 20) ---');
    votes.slice(0, 20).forEach((item, index) => {
      console.log(`${index + 1}位: ${item._count.targetContent}票 - ${item.targetContent}`);
    });
    console.log('-----------------------------------\n');

  } catch (error) {
    console.error('Error fetching ranking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getRanking();
