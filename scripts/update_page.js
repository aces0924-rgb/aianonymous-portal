const fs = require('fs');

function updatePage() {
  const c = fs.readFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', 'utf8');

  // Find the return statement
  const start = c.indexOf('return (\n    <main className="min-h-screen');
  
  if (start === -1) {
    console.error('Could not find return statement');
    return;
  }

  // The code before the return statement
  let beforeReturn = c.substring(0, start);

  // We need to remove the renderThumbnailButton function from the page because it's now in TrackDetailView
  beforeReturn = beforeReturn.replace(/const renderThumbnailButton[\s\S]*?};\n\n/g, '');

  // We need to import TrackDetailView
  if (!beforeReturn.includes('import TrackDetailView')) {
    beforeReturn = beforeReturn.replace(
      "import TrackJumpInput from '@/components/TrackJumpInput'",
      "import TrackJumpInput from '@/components/TrackJumpInput'\nimport TrackDetailView from '@/components/TrackDetailView'"
    );
  }

  const newReturn = `  return (
    <TrackDetailView
      track={track}
      eventSlug={eventSlug}
      audioSource={audioSource}
      showCreators={showCreators}
      defaultFeatures={defaultFeatures}
      defaultLabels={defaultLabels}
      tracksListUrl={tracksListUrl}
      allTracks={allTracks}
      prevTrack={prevTrack}
      nextTrack={nextTrack}
      trackIds={trackIds}
      tableQuery={tableQuery}
      activeTable={activeTable}
      thumbnail={thumbnail}
      preview={preview}
    />
  );
}
`;

  fs.writeFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', beforeReturn + newReturn);
  console.log('Updated page.tsx');
}

updatePage();
