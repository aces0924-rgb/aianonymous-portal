const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

c = c.replace(
  /className="space-y-6 text-lg md:text-xl text-foreground leading-relaxed font-light custom-rule-content prose prose-invert prose-p:text-foreground prose-headings:text-foreground prose-a:text-\[var\(--color-cyan-400\)\] max-w-none"/g,
  'className="space-y-6 text-lg md:text-xl text-foreground leading-relaxed font-light custom-rule-content prose prose-p:text-foreground prose-headings:text-foreground prose-a:text-[var(--color-cyan-400)] prose-li:text-foreground prose-strong:text-foreground max-w-none"'
);

c = c.replace(
  /className="prose prose-invert prose-p:text-foreground prose-headings:text-foreground prose-a:text-\[var\(--color-cyan-400\)\] max-w-none px-0 custom-quill-content"/g,
  'className="prose prose-p:text-foreground prose-headings:text-foreground prose-a:text-[var(--color-cyan-400)] prose-li:text-foreground prose-strong:text-foreground max-w-none px-0 custom-quill-content"'
);

fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
console.log('Fixed prose classes');
