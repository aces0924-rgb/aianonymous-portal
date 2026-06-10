import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.premiereSchedule.update({
    where: { day: 16 },
    data: {
      date: new Date('2026-06-06T21:00:00+09:00'),
      remarks: 'グランドフィナーレ・結果発表！'
    }
  });

  console.log('Last Day has been updated to June 6th, 21:00.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
