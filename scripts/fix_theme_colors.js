const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // We want to alias all cyan colors to our main theme colors so the user's custom color takes full effect!
    // We already mapped --color-cyan-300 through 950 to mainColor in layout.tsx.
    // However, Tailwind v4 sometimes ignores CSS variable overrides for opacity modifiers if not configured correctly,
    // or maybe the user is seeing un-aliased colors (like blue, purple, red) from the gradients!
    
    // Convert hardcoded gradients
    content = content.replace(/from-cyan-[0-9]{3}/g, 'from-[var(--color-cyan-400)]');
    content = content.replace(/via-cyan-[0-9]{3}/g, 'via-[var(--color-cyan-400)]');
    content = content.replace(/to-cyan-[0-9]{3}/g, 'to-[var(--color-cyan-400)]');
    
    content = content.replace(/from-blue-[0-9]{3}/g, 'from-[var(--color-cyan-600)]');
    content = content.replace(/to-blue-[0-9]{3}/g, 'to-[var(--color-cyan-600)]');
    content = content.replace(/via-purple-[0-9]{3}/g, 'via-[var(--color-cyan-500)]');
    
    // Replace text and bg
    content = content.replace(/text-cyan-[0-9]{3}/g, 'text-[var(--color-cyan-400)]');
    content = content.replace(/bg-cyan-[0-9]{3}/g, 'bg-[var(--color-cyan-500)]');
    content = content.replace(/border-cyan-[0-9]{3}/g, 'border-[var(--color-cyan-400)]');
    content = content.replace(/shadow-\[0_0_[^\]]+cyan[^\]]+\]/g, 'shadow-[0_0_20px_var(--color-glow)]');
    content = content.replace(/shadow-\[0_0_[^\]]+rgba\(6,182,212[^\]]+\]/g, 'shadow-[0_0_20px_var(--color-glow)]');
    content = content.replace(/shadow-\[0_0_[^\]]+rgba\(34,211,238[^\]]+\]/g, 'shadow-[0_0_20px_var(--color-glow)]');

    // Make sure we didn't break focus-within:border-[var(--color-cyan-400)]
    // Tailwind handles arbitrary values perfectly fine.

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed theme colors in', filePath);
    }
  }
});
