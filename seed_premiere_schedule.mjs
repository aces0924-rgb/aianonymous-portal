import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scheduleData = [
  { day: 1, date: new Date('2026-05-11T22:00:00'), trackRange: 'No.001 〜 No.014', trackCount: 14, remarks: '開幕！' },
  { day: 2, date: new Date('2026-05-12T22:00:00'), trackRange: 'No.015 〜 No.028', trackCount: 14, remarks: null },
  { day: 3, date: new Date('2026-05-13T22:00:00'), trackRange: 'No.029 〜 No.042', trackCount: 14, remarks: null },
  { day: 4, date: new Date('2026-05-14T22:00:00'), trackRange: 'No.043 〜 No.056', trackCount: 14, remarks: null },
  { day: 5, date: new Date('2026-05-15T22:00:00'), trackRange: 'No.057 〜 No.071', trackCount: 15, remarks: '1週目締め（+1曲）' },
  { day: 6, date: new Date('2026-05-18T22:00:00'), trackRange: 'No.072 〜 No.085', trackCount: 14, remarks: '2週目開始' },
  { day: 7, date: new Date('2026-05-19T22:00:00'), trackRange: 'No.086 〜 No.099', trackCount: 14, remarks: null },
  { day: 8, date: new Date('2026-05-20T22:00:00'), trackRange: 'No.100 〜 No.113', trackCount: 14, remarks: '折り返し地点' },
  { day: 9, date: new Date('2026-05-21T22:00:00'), trackRange: 'No.114 〜 No.127', trackCount: 14, remarks: null },
  { day: 10, date: new Date('2026-05-22T22:00:00'), trackRange: 'No.128 〜 No.141', trackCount: 14, remarks: '2週目締め' },
  { day: 11, date: new Date('2026-05-25T22:00:00'), trackRange: 'No.142 〜 No.155', trackCount: 14, remarks: '最終週開始' },
  { day: 12, date: new Date('2026-05-26T22:00:00'), trackRange: 'No.156 〜 No.169', trackCount: 14, remarks: null },
  { day: 13, date: new Date('2026-05-27T22:00:00'), trackRange: 'No.170 〜 No.183', trackCount: 14, remarks: null },
  { day: 14, date: new Date('2026-05-28T22:00:00'), trackRange: 'No.184 〜 No.197', trackCount: 14, remarks: null },
  { day: 15, date: new Date('2026-05-29T22:00:00'), trackRange: 'No.198 〜 No.212', trackCount: 15, remarks: '最終日！' },
];

async function main() {
  console.log('Seeding premiere schedule...');
  for (const item of scheduleData) {
    await prisma.premiereSchedule.upsert({
      where: { day: item.day },
      update: item,
      create: item,
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
