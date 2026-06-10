const fs = require('fs');

function fixColors(path) {
  let c = fs.readFileSync(path, 'utf8');

  // Replace shadow and drop-shadow rgba cyan colors with var(--color-cyan-400)
  c = c.replace(/rgba\(0,240,255,[0-9.]+\)/g, 'var(--color-cyan-400)');
  
  // Replace hardcoded #00f0ff (if used in shadows)
  c = c.replace(/#00f0ff/g, 'var(--color-cyan-400)');

  // Fix the default theme fallback since we replaced '#00f0ff' with var(--color-cyan-400) in JS
  // It's line 76: mainColor: themeConfig.mainColor || 'var(--color-cyan-400)'
  // We want the JS variable to be actual hex if possible, so we change it back:
  c = c.replace(`mainColor: themeConfig.mainColor || 'var(--color-cyan-400)'`, `mainColor: themeConfig.mainColor || '#00f0ff'`);

  fs.writeFileSync(path, c);
  console.log('Fixed', path);
}

fixColors('src/app/[eventSlug]/page.tsx');
