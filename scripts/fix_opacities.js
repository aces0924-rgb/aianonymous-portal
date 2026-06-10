const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

// Fix 389: The big glowing blob
c = c.replace(
  /bg-\[var\(--color-cyan-400\)\]\/10 blur-\[100px\]/g,
  'bg-[var(--color-cyan-400)] opacity-20 blur-[100px]'
);

// Fix 403: The watermark number
c = c.replace(
  /text-\[var\(--color-cyan-400\)\]\/10 select-none group-hover:text-\[var\(--color-cyan-400\)\]\/20/g,
  'text-[var(--color-cyan-400)] opacity-10 select-none group-hover:opacity-20'
);

// Fix 410: The icon wrapper
c = c.replace(
  /bg-\[var\(--color-cyan-400\)\]\/10 text-\[var\(--color-cyan-400\)\] border border-\[var\(--color-cyan-400\)\]\/20/g,
  'bg-[var(--color-cyan-950)] text-[var(--color-cyan-400)] border border-[var(--color-cyan-950)]'
);

// Fix 444: Hover border for FAQ (border-[var(--color-cyan-400)]/50)
c = c.replace(
  /hover:border-\[var\(--color-cyan-400\)\]\/50/g,
  'hover:border-[var(--color-cyan-400)]' // just use full color, it's fine for hover
);

fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
console.log('Fixed opacity modifiers');
