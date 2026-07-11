import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findUnique({ where: { slug: 'aisummer2026' } });
  if (!event) return;
  
  const tracks = await prisma.track.findMany({ where: { eventId: event.id } });
  
  let day1Tracks = [];
  let day2Tracks = [];
  
  for (const t of tracks) {
    let textToSearch = Object.values(t).map(v => typeof v === 'string' ? v : '').join(' | ').toUpperCase();
    
    if (textToSearch.includes('1DAY') || textToSearch.includes('DAY1') || textToSearch.includes('1日目') || textToSearch.includes('DAY 1')) {
      day1Tracks.push(t.entryNo);
    } else if (textToSearch.includes('2DAY') || textToSearch.includes('DAY2') || textToSearch.includes('2日目') || textToSearch.includes('DAY 2')) {
      day2Tracks.push(t.entryNo);
    }
  }
  
  console.log('DAY 1 EntryNos:', day1Tracks.filter(Boolean).sort().join(','));
  console.log('DAY 2 EntryNos:', day2Tracks.filter(Boolean).sort().join(','));
}
main().finally(() => prisma.$disconnect());
