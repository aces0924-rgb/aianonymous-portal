import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findUnique({ where: { slug: 'aisummer2026' } });
  if (!event) { console.log('Event not found'); return; }
  
  const tracks = await prisma.track.findMany({ where: { eventId: event.id } });
  
  let day1Tracks = [];
  let day2Tracks = [];
  let unknownTracks = [];
  
  for (const t of tracks) {
    let textToSearch = Object.values(t).map(v => typeof v === 'string' ? v : '').join(' | ').toUpperCase();
    
    if (textToSearch.includes('1DAY') || textToSearch.includes('DAY1') || textToSearch.includes('1日目') || textToSearch.includes('DAY 1')) {
      day1Tracks.push(t);
    } else if (textToSearch.includes('2DAY') || textToSearch.includes('DAY2') || textToSearch.includes('2日目') || textToSearch.includes('DAY 2')) {
      day2Tracks.push(t);
    } else {
      unknownTracks.push(t);
    }
  }

  // Insert DAY 1
  const day1EntryNos = day1Tracks.map(t => t.entryNo).filter(Boolean).sort().join(',');
  await prisma.premiereSchedule.upsert({
    where: { eventId_day: { eventId: event.id, day: 1 } },
    update: {
      date: new Date('2026-07-18T19:00:00+09:00'),
      youtubeUrl: 'https://youtu.be/Y00aijSgbo4',
      trackRange: day1EntryNos,
      trackCount: day1Tracks.length,
      isPublic: true
    },
    create: {
      eventId: event.id,
      day: 1,
      date: new Date('2026-07-18T19:00:00+09:00'),
      youtubeUrl: 'https://youtu.be/Y00aijSgbo4',
      trackRange: day1EntryNos,
      trackCount: day1Tracks.length,
      isPublic: true
    }
  });

  // Insert DAY 2
  const day2EntryNos = day2Tracks.map(t => t.entryNo).filter(Boolean).sort().join(',');
  await prisma.premiereSchedule.upsert({
    where: { eventId_day: { eventId: event.id, day: 2 } },
    update: {
      date: new Date('2026-07-19T19:00:00+09:00'),
      youtubeUrl: 'https://youtu.be/4ZcmQB-O_rA',
      trackRange: day2EntryNos,
      trackCount: day2Tracks.length,
      isPublic: true
    },
    create: {
      eventId: event.id,
      day: 2,
      date: new Date('2026-07-19T19:00:00+09:00'),
      youtubeUrl: 'https://youtu.be/4ZcmQB-O_rA',
      trackRange: day2EntryNos,
      trackCount: day2Tracks.length,
      isPublic: true
    }
  });

  console.log('Registration complete.');
  console.log(`\n--- Could not assign to DAY1 or DAY2 (Total: ${unknownTracks.length}) ---`);
  unknownTracks.forEach(t => {
    // Check if it's an illustration
    const isIllustration = (t.title && t.title.includes('イラスト')) || (t.genre && t.genre.includes('イラスト'));
    if (!isIllustration) {
      console.log(`[MUSIC?] ${t.entryNo}: ${t.artistName} - ${t.title}`);
    } else {
      console.log(`[ILLUST] ${t.entryNo}: ${t.artistName} - ${t.title}`);
    }
  });
}
main().finally(() => prisma.$disconnect());
