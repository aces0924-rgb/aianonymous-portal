const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ill = await prisma.userIllustrationPlaylist.findMany({ take: 3 });
  console.log("Illustration Playlists:", JSON.stringify(ill, null, 2));

  const tracks = await prisma.track.findMany({ take: 5, select: { entryNo: true, title: true, eventId: true } });
  console.log("Tracks:", JSON.stringify(tracks, null, 2));

  const trackHonbans = await prisma.trackHonban.findMany({ take: 5, select: { entryNo: true, title: true, eventId: true } });
  console.log("TrackHonbans:", JSON.stringify(trackHonbans, null, 2));

  await prisma.$disconnect();
}
main();
