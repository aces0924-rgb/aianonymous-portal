const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isIllustration = (url) => {
  if (!url) return false;
  const isVideo = url.match(/(?:youtu\.be\/|youtube\.com\/|nicovideo\.jp\/|nico\.ms\/|suno\.com\/)/);
  if (isVideo) return false;
  return !!(url.match(/\.(jpeg|jpg|gif|png)$/i) || url.includes('pbs.twimg.com') || url.includes('gyazo.com'));
};

async function main() {
  const sourceEventId = '60d8b97e-452c-4fe8-b5d9-f4dbc22485e0'; // AISUPERLIVESUMMER2026
  const targetEventId = 'a8235d97-c159-4b85-afe4-83d4cac61e23'; // 天ロック-2026夏-

  const sourceTracks = await prisma.track.findMany({
    where: { eventId: sourceEventId },
    orderBy: { id: 'asc' }
  });

  const musicTracks = sourceTracks.filter(t => !isIllustration(t.songUrl));

  console.log(`Source tracks: ${sourceTracks.length}`);
  console.log(`Music tracks to copy: ${musicTracks.length}`);

  const targetTracks = await prisma.track.findMany({
    where: { eventId: targetEventId },
    orderBy: { id: 'desc' }
  });
  let nextEntryNo = targetTracks.length > 0 ? parseInt(targetTracks[0].entryNo || "0", 10) + 1 : 1;

  let copiedCount = 0;
  for (const track of musicTracks) {
    const existing = await prisma.track.findFirst({
      where: { eventId: targetEventId, songUrl: track.songUrl }
    });

    if (!existing) {
      await prisma.track.create({
        data: {
          eventId: targetEventId,
          entryNo: String(nextEntryNo++),
          title: track.title,
          artistName: track.artistName,
          genre: track.genre,
          songUrl: track.songUrl,
          audioUrl: track.audioUrl,
          lyrics: track.lyrics,
          analysis: track.analysis,
          password: track.password || "",
          published: track.published,
          timestamp: new Date().toISOString() + "_" + track.id // Unique constraint workaround
        }
      });
      copiedCount++;
    }
  }

  console.log(`Copied ${copiedCount} tracks successfully.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
