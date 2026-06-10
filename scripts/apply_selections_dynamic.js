const fs = require('fs');

function fixSelectionPage(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf-8');

  // Fix function signature
  c = c.replace(
    `export default async function SelectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id: encodedId } = await params;`,
    `export default async function SelectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string, id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { eventSlug, id: encodedId } = await params;
  
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();`
  );

  // Fix ACTIVE_TRACK_TABLE setting query
  c = c.replace(
    `const activeTableSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_TRACK_TABLE' } })`,
    `const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } })`
  );

  // Fix SHARE_BASE_POST_URL setting query
  c = c.replace(
    `const shareBasePostUrlSetting = await (prisma as any).setting.findUnique({ where: { key: 'SHARE_BASE_POST_URL' } })`,
    `const shareBasePostUrlSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'SHARE_BASE_POST_URL' } } })`
  );

  // Fix Links
  c = c.replace(
    `href={\`/selections\${previewQuery}\`}`,
    `href={\`/\${eventSlug}/selections\${previewQuery}\`}`
  );

  c = c.replace(
    `href={\`/selection/\${encodeSelectionId(p.id)}\${previewQuery}\`}`,
    `href={\`/\${eventSlug}/selection/\${encodeSelectionId(p.id)}\${previewQuery}\`}`
  );

  c = c.replace(
    `href="/#tracks"`,
    `href={\`/\${eventSlug}/#tracks\`}`
  );

  // For illustration specific links
  c = c.replace(
    `href={\`/selections/illustrations\${previewQuery}\`}`,
    `href={\`/\${eventSlug}/selections/illustrations\${previewQuery}\`}`
  );

  c = c.replace(
    `href={\`/selection/illustration/\${encodeSelectionId(p.id)}\${previewQuery}\`}`,
    `href={\`/\${eventSlug}/selection/illustration/\${encodeSelectionId(p.id)}\${previewQuery}\`}`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed:', path);
}

fixSelectionPage('src/app/[eventSlug]/selection/[id]/page.tsx');
fixSelectionPage('src/app/[eventSlug]/selection/illustration/[id]/page.tsx');

