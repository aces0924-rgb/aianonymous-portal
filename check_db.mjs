import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const activeTableSetting = await prisma.setting.findUnique({ where: { key: 'ACTIVE_TRACK_TABLE' } });
  const activeTable = activeTableSetting?.value || "track";
  console.log(`ACTIVE_TRACK_TABLE: ${activeTable}`);

  const tracks = await prisma.track.findMany({
    where: { entryNo: { in: ['026', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036'] } },
    select: { entryNo: true, published: true, analysis: true }
  });
  console.log("--- Track Table ---");
  tracks.forEach(t => {
    console.log(`${t.entryNo}: published=${t.published}, analysis=${t.analysis ? "YES" : "NO"}`);
  });

  const tracksHonban = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ['026', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036'] } },
    select: { entryNo: true, published: true, analysis: true }
  });
  console.log("--- TrackHonban Table ---");
  tracksHonban.forEach(t => {
    console.log(`${t.entryNo}: published=${t.published}, analysis=${t.analysis ? "YES" : "NO"}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
