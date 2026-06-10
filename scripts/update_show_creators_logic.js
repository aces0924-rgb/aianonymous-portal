const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', 'utf-8');

c = c.replace(
  `  const defaultFeatures = {
    enableThumbnailSubmit: featureFlags.enableThumbnailSubmit ?? true,
    enableAnonymityPolicy: featureFlags.enableAnonymityPolicy ?? true
  };`,
  `  const defaultFeatures = {
    enableThumbnailSubmit: featureFlags.enableThumbnailSubmit ?? true,
    enableAnonymityPolicy: featureFlags.enableAnonymityPolicy ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false
  };`
);

c = c.replace(
  "  const isShowCreatorsDb = showCreatorsSetting?.value === 'true';",
  "  const isShowCreatorsDb = defaultFeatures.enableShowCreators;"
);

fs.writeFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', c);
console.log('Tracks page showCreators logic updated');
