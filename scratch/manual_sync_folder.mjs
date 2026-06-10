import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function sync() {
  const apiKey = 'AIzaSyAze71Lj44kuYS7iV7jME8r6DbvKYBHIxc';
  const folderId = '1v4r9-w66hyhWpeYx8OkU5B2t61D0rl4e';
  
  console.log(`Starting manual G Drive folder sync...`);
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=files(id,name)&pageSize=1000`;
  
  const driveRes = await fetch(driveUrl);
  const driveData = await driveRes.json();
  const files = driveData.files || [];
  
  /* // Loop through files and update audioUrl (User manually updates audioUrl, so disabled)
  let matchCount = 0;
  for (const file of files) {
    const match = file.name.match(/^(\d+)/);
    if (!match) continue;
    
    const normalizedNo = match[1].padStart(3, '0');
    const directUrl = `https://docs.google.com/uc?export=download&id=${file.id}`;
    
    console.log(`Matching ${file.name} -> EntryNo ${normalizedNo}`);
    
    const res = await prisma.track.updateMany({
      where: { entryNo: normalizedNo },
      data: { audioUrl: directUrl }
    });
    
    if (res.count > 0) matchCount++;
  }
  
  console.log(`✅ Manual sync finished. Matched ${matchCount} files.`);
  */
  console.log(`✅ Manual G Drive folder sync is currently DISABLED as per user request.`);
}

sync()
  .catch(err => {
    console.error("Sync Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
