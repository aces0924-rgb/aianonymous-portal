const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;

      // Match: where: { key: '...' }
      // Replace with: where: { eventId_key: { eventId: event.id, key: '...' } }
      const regex = /where:\s*{\s*key:\s*('[^']+'|"[^"]+")\s*}/g;
      if (regex.test(content)) {
        content = content.replace(regex, "where: { eventId_key: { eventId: event.id, key: $1 } }");
        modified = true;
      }

      // 念のため prisma.setting.upsert({ where: { key: ... } }) もあれば直す必要あるが、
      // それは admin 側だけのはず。
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '../src/app/[eventSlug]'));
// also recommend folder
processDir(path.join(__dirname, '../src/app/recommend'));
