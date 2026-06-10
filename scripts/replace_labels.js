const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

c = c.replace(/<span className="text-foreground\/80 font-mono text-sm tracking-widest">\/ 募集要項<\/span>/g, '<span className="text-foreground/80 font-mono text-sm tracking-widest">/ {defaultLabels.guidelinesTitle || \'募集要項\'}</span>');

fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
