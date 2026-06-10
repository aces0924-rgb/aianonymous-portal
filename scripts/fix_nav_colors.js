const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

// 1. In the header block (nav-index), fix icons to text-cyan-400 and shadows to cyan glow
let headerStart = c.indexOf('<nav id="nav-index"');
let headerEnd = c.indexOf('</nav>', headerStart) + 6;

if (headerStart !== -1 && headerEnd !== -1) {
  let headerCode = c.substring(headerStart, headerEnd);
  
  // Fix icons
  headerCode = headerCode.replace(/text-\[var\(--color-cyan-400\)\]/g, 'text-cyan-400');
  headerCode = headerCode.replace(/drop-shadow-\[0_0_8px_var\(--color-glow\)\]/g, 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]');
  
  // Fix labels to white
  headerCode = headerCode.replace(/text-foreground hover:text-foreground/g, 'text-white hover:text-white');
  
  // Fix the JUMP bar if it uses any dynamic variables
  headerCode = headerCode.replace(/focus-within:border-\[var\(--color-cyan-400\)\]/g, 'focus-within:border-cyan-500');
  headerCode = headerCode.replace(/focus-within:shadow-\[0_0_20px_var\(--color-glow\)\]/g, 'focus-within:shadow-[0_0_20px_rgba(6,182,212,0.5)]');

  c = c.substring(0, headerStart) + headerCode + c.substring(headerEnd);
  fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
  console.log('Fixed header colors in page.tsx');
} else {
  console.log('nav-index not found');
}
