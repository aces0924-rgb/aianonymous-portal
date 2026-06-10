const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    content = content.replace(/rgba\(0,\s*240,\s*255,\s*[0-9.]+\)/g, 'var(--color-cyan-400)');
    content = content.replace(/#00f0ff/g, 'var(--color-cyan-400)');

    if (content !== originalContent) {
      // Fix default theme logic just in case it's in other files
      content = content.replace(`mainColor: themeConfig.mainColor || 'var(--color-cyan-400)'`, `mainColor: themeConfig.mainColor || '#00f0ff'`);
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
