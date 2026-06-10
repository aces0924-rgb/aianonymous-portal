const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', 'utf8');

const target = '    enableShowCreators: featureFlags.enableShowCreators ?? false\\n    : await prisma.track.findFirst';

const replacement = `    enableShowCreators: featureFlags.enableShowCreators ?? false
  };
  const trackId = parseInt(resolvedParams.id, 10);
  if (isNaN(trackId)) return notFound();
  
  const activeTableSetting = await prisma.setting.findFirst({ where: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } });
  const showCreatorsSetting = await prisma.setting.findFirst({ where: { eventId: event.id, key: 'SHOW_CREATORS' } });
  
  const isHonban = preview === 'honban' || table === 'track_honban';
  const activeTable = isHonban ? 'track_honban' : (activeTableSetting?.value || 'track');

  const track = activeTable === 'track_honban'
    ? await prisma.trackHonban.findFirst({ where: { id: trackId, eventId: event.id } })
    : await prisma.track.findFirst`;

if (c.includes('    enableShowCreators: featureFlags.enableShowCreators ?? false\n    : await prisma.track.findFirst')) {
  c = c.replace('    enableShowCreators: featureFlags.enableShowCreators ?? false\n    : await prisma.track.findFirst', replacement);
  fs.writeFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', c);
  console.log('Fixed page.tsx');
} else if (c.includes('    enableShowCreators: featureFlags.enableShowCreators ?? false\r\n    : await prisma.track.findFirst')) {
  c = c.replace('    enableShowCreators: featureFlags.enableShowCreators ?? false\r\n    : await prisma.track.findFirst', replacement.replace(/\n/g, '\r\n'));
  fs.writeFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', c);
  console.log('Fixed page.tsx (CRLF)');
} else {
  console.log('Target not found');
}
