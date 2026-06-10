const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('guidelines') || l.includes('フェスコンセプト')) console.log(i + ': ' + l);
});
