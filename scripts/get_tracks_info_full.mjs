import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { not: null } },
    select: { entryNo: true, title: true, lyrics: true, analysis: true },
    orderBy: { entryNo: 'asc' }
  });
  
  // JSONファイルとして書き出し（コンソール制限を避けるため）
  fs.writeFileSync('scripts/audit_data.json', JSON.stringify(tracks, null, 2));
  console.log(`Fetched ${tracks.length} tracks. Data saved to scripts/audit_data.json`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
