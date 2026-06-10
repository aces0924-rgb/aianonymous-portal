const fs = require('fs');

function fixJumpBar(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  
  // Revert dynamic cyan to fixed cyan and white for TrackJumpModern and TrackJumpInput
  c = c.replace(/text-\[var\(--color-cyan-400\)\]/g, 'text-cyan-400');
  c = c.replace(/text-\[var\(--color-cyan-500\)\]/g, 'text-cyan-500');
  c = c.replace(/bg-\[var\(--color-cyan-500\)\]/g, 'bg-cyan-500');
  c = c.replace(/border-\[var\(--color-cyan-400\)\]/g, 'border-cyan-400');
  c = c.replace(/border-\[var\(--color-cyan-500\)\]/g, 'border-cyan-500');
  
  c = c.replace(/focus-within:border-\[var\(--color-cyan-500\)\]/g, 'focus-within:border-cyan-500');
  c = c.replace(/focus-within:shadow-\[0_0_20px_var\(--color-glow\)\]/g, 'focus-within:shadow-[0_0_20px_rgba(6,182,212,0.5)]');

  fs.writeFileSync(filePath, c);
  console.log('Fixed', filePath);
}

fixJumpBar('src/components/TrackJumpModern.tsx');
fixJumpBar('src/components/TrackJumpInput.tsx');
