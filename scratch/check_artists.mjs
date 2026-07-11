import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findUnique({ where: { slug: 'aisummer2026' } });
  if (!event) { console.log('Event not found'); return; }
  
  const tracks = await prisma.track.findMany({
    where: { eventId: event.id },
    select: { entryNo: true, title: true, artistName: true }
  });
  
  const day1Tracks = [];
  const day2Tracks = [];
  const unknownTracks = [];
  
  for (const t of tracks) {
    if (!t.artistName) {
      unknownTracks.push(t);
      continue;
    }
    const name = t.artistName.toUpperCase();
    if (name.includes('1DAY') || name.includes('DAY1') || name.includes('1日目') || name.includes('DAY 1')) {
      day1Tracks.push(t);
    } else if (name.includes('2DAY') || name.includes('DAY2') || name.includes('2日目') || name.includes('DAY 2')) {
      day2Tracks.push(t);
    } else {
      unknownTracks.push(t);
    }
  }
  
  console.log(`Event ID: ${event.id}`);
  console.log(`Total Tracks: ${tracks.length}`);
  console.log(`DAY 1 Count: ${day1Tracks.length}`);
  console.log(`DAY 2 Count: ${day2Tracks.length}`);
  console.log(`Unknown Count: ${unknownTracks.length}`);
  
  if (unknownTracks.length > 0) {
    console.log('\n--- Unknown Artists ---');
    unknownTracks.forEach(t => console.log(`${t.entryNo}: ${t.artistName} - ${t.title}`));
  }
  
  const day1EntryNos = day1Tracks.map(t => t.entryNo).filter(Boolean).sort();
  const day2EntryNos = day2Tracks.map(t => t.entryNo).filter(Boolean).sort();
  
  console.log('\nDAY 1 EntryNos:', day1EntryNos.join(','));
  console.log('\nDAY 2 EntryNos:', day2EntryNos.join(','));
}
main().finally(() => prisma.$disconnect());
