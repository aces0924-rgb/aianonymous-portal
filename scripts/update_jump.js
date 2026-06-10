const fs = require('fs');
let c = fs.readFileSync('src/components/TrackJumpModern.tsx', 'utf8');

// 1. Update TrackInfo interface
c = c.replace(
  /interface TrackInfo \{\n  id: number;\n  entryNo: string \| null;\n  title: string;\n\}/,
  'interface TrackInfo {\n  id: number;\n  entryNo: string | null;\n  title: string;\n  artist?: string | null;\n}'
);

// 2. Add enableShowCreators to props
c = c.replace(
  /preview\?:\s*string\s*\n\}\)/,
  'preview?: string\n  enableShowCreators?: boolean\n})'
);
c = c.replace(
  /tracks,\n  preview\n\}: \{/,
  'tracks,\n  preview,\n  enableShowCreators = false\n}: {'
);
c = c.replace(
  /tracks,\s*preview\s*\}: \{/,
  'tracks, preview, enableShowCreators = false }: {'
);

// 3. Update search logic to include artist
c = c.replace(
  /const titleMatch = t\.title\.toLowerCase\(\)\.includes\(q\);/,
  'const titleMatch = t.title.toLowerCase().includes(q);\n    const artistMatch = enableShowCreators && t.artist ? t.artist.toLowerCase().includes(q) : false;'
);
c = c.replace(
  /return entryMatch \|\| titleMatch;/,
  'return entryMatch || titleMatch || artistMatch;'
);

// 4. Update placeholder
c = c.replace(
  /placeholder="曲名・番号で検索\.\.\."/,
  'placeholder={enableShowCreators ? "曲名・番号・アーティスト名で検索..." : "曲名・番号で検索..."}'
);

fs.writeFileSync('src/components/TrackJumpModern.tsx', c);
console.log('Updated TrackJumpModern.tsx');
