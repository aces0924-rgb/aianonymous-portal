const fs = require('fs');

let path = 'src/components/TrackListCard.tsx';
let c = fs.readFileSync(path, 'utf-8');

c = c.replace(
  `import { useFavorites } from '@/context/FavoritesContext';`,
  `import { useFavorites } from '@/context/FavoritesContext';
import { useParams } from 'next/navigation';`
);

c = c.replace(
  `  const { isFavorite, toggleFavorite, isInterested, toggleInterested } = useFavorites();`,
  `  const { isFavorite, toggleFavorite, isInterested, toggleInterested } = useFavorites();
  const params = useParams();
  const eventSlug = params?.eventSlug as string || '';`
);

// If eventSlug exists, prefix the URL
c = c.replace(
  `  const detailUrl = preview === 'honban' 
    ? \`/tracks/\${track.id}?preview=honban\` 
    : \`/tracks/\${track.id}\`;`,
  `  const prefix = eventSlug ? \`/\${eventSlug}\` : '';
  const detailUrl = preview === 'honban' 
    ? \`\${prefix}/tracks/\${track.id}?preview=honban\` 
    : \`\${prefix}/tracks/\${track.id}\`;`
);

fs.writeFileSync(path, c);
console.log('Fixed TrackListCard links');
