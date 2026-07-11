const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.userPlaylist.count();
  const sub = await prisma.userPlaylistSub.count();
  const ill = await prisma.userIllustrationPlaylist.count();
  console.log({ userPlaylist: p, userPlaylistSub: sub, userIllustrationPlaylist: ill });
  await prisma.$disconnect();
}
main();
