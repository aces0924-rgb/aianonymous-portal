import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetNos = ['089', '090', '091', '092', '093', '094', '095', '096'];
  
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        in: targetNos
      }
    },
    orderBy: {
      entryNo: 'asc'
    }
  });

  if (tracks.length === 0) {
    console.log("No tracks found with padded No. 089-096.");
  } else {
    // 取得したデータをJSON形式で出力し、考察の材料にする
    console.log(JSON.stringify(tracks, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
