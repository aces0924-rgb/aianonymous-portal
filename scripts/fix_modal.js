const fs = require('fs');

const path = 'src/components/RecommendationModal.tsx';
let c = fs.readFileSync(path, 'utf8');

// Add useParams
c = c.replace(
  `import { useRouter } from 'next/navigation';`,
  `import { useRouter, useParams } from 'next/navigation';`
);

// Add eventSlug variable
c = c.replace(
  `  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const router = useRouter();`,
  `  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const router = useRouter();
  const params = useParams();
  const eventSlug = params?.eventSlug as string || '';`
);

// Update calls inside useEffect
c = c.replace(
  `getMaxIllustLimit().then(limit => setMaxIllustLimit(limit));`,
  `if(eventSlug) getMaxIllustLimit(eventSlug).then(limit => setMaxIllustLimit(limit));`
);

c = c.replace(
  `getEnableIllustRecommend().then(enabled => setIsIllustEnabled(enabled));`,
  `if(eventSlug) getEnableIllustRecommend(eventSlug).then(enabled => setIsIllustEnabled(enabled));`
);

c = c.replace(
  `const titles = await getTrackTitlesByIds(selectedIds);`,
  `const titles = await getTrackTitlesByIds(eventSlug, selectedIds);`
);

c = c.replace(
  `const count = await getRegistrationCount(userName);`,
  `const count = await getRegistrationCount(eventSlug, userName);`
);

c = c.replace(
  `const illustCount = await getIllustrationRegistrationCount(userName);`,
  `const illustCount = await getIllustrationRegistrationCount(eventSlug, userName);`
);

// Update calls inside handleSubmit
c = c.replace(
  `result = await registerPlaylist(userName.trim(), selectedIds.join(','), xAccountId.trim(), appeal.trim());`,
  `result = await registerPlaylist(eventSlug, userName.trim(), selectedIds.join(','), xAccountId.trim(), appeal.trim());`
);

c = c.replace(
  `result = await registerIllustrationPlaylist(userName.trim(), selectedIds.join(','), xAccountId.trim(), appeal.trim());`,
  `result = await registerIllustrationPlaylist(eventSlug, userName.trim(), selectedIds.join(','), xAccountId.trim(), appeal.trim());`
);

// Update router.push destinations
c = c.replace(
  `router.push(\`/selection/\${encodedId}\`);`,
  `router.push(\`/\${eventSlug}/selection/\${encodedId}\`);`
);

c = c.replace(
  `router.push(\`/selections/illustrations\`);`,
  `router.push(\`/\${eventSlug}/selections/illustrations\`);`
);

fs.writeFileSync(path, c);
console.log('Fixed RecommendationModal');
