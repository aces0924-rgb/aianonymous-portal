import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Day 0
  await prisma.premiereSchedule.upsert({
    where: { day: 0 },
    update: {
      date: new Date('2026-05-10T00:00:00+09:00'),
      trackRange: '-',
      trackCount: 0,
      remarks: 'イベント特設サイト公開！'
    },
    create: {
      day: 0,
      date: new Date('2026-05-10T00:00:00+09:00'),
      trackRange: '-',
      trackCount: 0,
      remarks: 'イベント特設サイト公開！'
    }
  });

  // Day 16 (Last Day)
  await prisma.premiereSchedule.upsert({
    where: { day: 16 },
    update: {
      date: new Date('2026-06-10T21:00:00+09:00'),
      trackRange: '-',
      trackCount: 0,
      remarks: 'グランドフィナーレ・結果発表！'
    },
    create: {
      day: 16,
      date: new Date('2026-06-10T21:00:00+09:00'),
      trackRange: '-',
      trackCount: 0,
      remarks: 'グランドフィナーレ・結果発表！'
    }
  });

  console.log('Special days (Day 0 & Day 16) have been added/updated.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
