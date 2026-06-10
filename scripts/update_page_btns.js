const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

// The Apply/Vote button uses `bg-gradient-to-r` and from/via/to classes.
// We will replace the Tailwind classes with `bg-[var(--color-btn-primary)]`.
// The user likes gradients but we can just use the flat color + a shadow, or inline style.
// Since we have inline style support via CSS variables, let's just do a flat background that glows.
c = c.replace(
  /bg-gradient-to-r \$\{.*?\}.*?\} text-white/s,
  `bg-[var(--color-btn-primary)] hover:brightness-110 text-white`
);

// For the YouTube button:
c = c.replace(
  /bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-foreground/,
  `bg-[var(--color-btn-secondary)] hover:brightness-110 text-white`
);

// Replace any hardcoded `bg-red-600` if it's there (there was one earlier)
c = c.replace(
  /bg-red-600 hover:bg-red-500 text-white/g,
  `bg-[var(--color-btn-secondary)] hover:brightness-110 text-white`
);

fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
console.log('Updated page.tsx buttons');
