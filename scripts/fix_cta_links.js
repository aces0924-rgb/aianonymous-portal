const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

c = c.replace(/href=\{voteUrl \|\| \'#\'\}\s*target=\{voteUrl \? \"_blank\" : undefined\}\s*rel=\{voteUrl \? \"noopener noreferrer\" : undefined\}/g,
  'href={ctaMode === \'apply\' ? `/${eventSlug}/apply` : (voteUrl || \'#\')}\n                  target={ctaMode === \'vote\' && voteUrl ? "_blank" : undefined}\n                  rel={ctaMode === \'vote\' && voteUrl ? "noopener noreferrer" : undefined}');

c = c.replace(/href=\{ctaMode === \'apply\' \? `\/\$\{eventSlug\}\/apply` : \(voteUrl \|\| \'#\'\)\}\s*target=\{ctaMode === \'vote\' && voteUrl \? \"_blank\" : undefined\}\s*rel=\{ctaMode === \'vote\' && voteUrl \? \"noopener noreferrer\" : undefined\}\s*className=\"w-full md:w-\[420px\] h-16 md:h-24/g,
  'href={playlistUrl}\n                  target="_blank"\n                  rel="noopener noreferrer"\n                  className="w-full md:w-[420px] h-16 md:h-24');

fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
console.log('Fixed page.tsx');
