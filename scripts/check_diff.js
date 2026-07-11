const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ill = await prisma.userIllustrationPlaylist.findMany({ where: { eventId: "60d8b97e-452c-4fe8-b5d9-f4dbc22485e0" } });
  let neededNos = new Set();
  ill.forEach(p => {
    if (p.trackEntryNos) {
      p.trackEntryNos.split(',').map(s => s.trim()).filter(Boolean).forEach(no => neededNos.add(no));
    }
  });

  const tracks = await prisma.track.findMany({ where: { eventId: "60d8b97e-452c-4fe8-b5d9-f4dbc22485e0" }, select: { entryNo: true } });
  let existingNos = new Set();
  tracks.forEach(t => existingNos.add(t.entryNo));

  console.log("Needed (sample):", Array.from(neededNos).slice(0, 10));
  console.log("Existing (sample):", Array.from(existingNos).slice(0, 10));

  let missing = 0;
  neededNos.forEach(no => {
    if (!existingNos.has(no)) missing++;
  });
  console.log("Total Needed:", neededNos.size);
  console.log("Total Existing:", existingNos.size);
  console.log("Missing from Track table:", missing);
  await prisma.$disconnect();
}
main();
