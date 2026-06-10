const fs = require('fs');

let pagePath = 'src/app/[eventSlug]/tracks/page.tsx';
let c = fs.readFileSync(pagePath, 'utf-8');

// 1. Update signature
c = c.replace(
  `export default async function TracksListPage({ searchParams }: { searchParams: Promise<{ table?: string, preview?: string }> }) {
  const { table, preview } = await searchParams;`,
  `import { notFound } from 'next/navigation';

export default async function TracksListPage({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ table?: string, preview?: string }> }) {
  const { eventSlug } = await params;
  const { table, preview } = await searchParams;

  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();`
);

// 2. Fix the setting query
c = c.replace(
  `  const activeTableSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_TRACK_TABLE' } });`,
  `  const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } });`
);

// 3. Fix the tracks queries
c = c.replace(
  `    ? await prisma.trackHonban.findMany({ 
        where: { published: true }, `,
  `    ? await prisma.trackHonban.findMany({ 
        where: { eventId: event.id, published: true }, `
);

c = c.replace(
  `    : await prisma.track.findMany({ 
        where: { published: true }, `,
  `    : await prisma.track.findMany({ 
        where: { eventId: event.id, published: true }, `
);

// 4. Fix thumbnails query
c = c.replace(
  `  // サムネイル登録状況（承認待ち・承認済み）を取得
  const thumbnails = await prisma.trackThumbnail.findMany({
    where: { status: { in: ['PENDING', 'APPROVED'] } },`,
  `  // サムネイル登録状況（承認待ち・承認済み）を取得
  const thumbnails = await prisma.trackThumbnail.findMany({
    where: { eventId: event.id, status: { in: ['PENDING', 'APPROVED'] } },`
);

// 5. Fix links (e.g. `href="/"`) to use eventSlug
c = c.replace(
  `  const homeUrl = preview === 'honban' ? '/?preview=honban' : '/';`,
  `  const homeUrl = preview === 'honban' ? \`/\${eventSlug}?preview=honban\` : \`/\${eventSlug}\`;`
);

// Change back link inside nav
c = c.replace(
  `          <Link href={homeUrl} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            <svg`,
  `          <Link href={homeUrl} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            <svg` // unchanged, it uses homeUrl
);

// Make sure other eventSlug mentions aren't missed. We can pass eventSlug to TrackListFilterable?
// I need to look at TrackListFilterable to see if it requires eventSlug or if it handles URLs.
// Wait, if it generates URLs like `/tracks/1`, it needs to know `/eventsSlug/tracks/1`.

fs.writeFileSync(pagePath, c);
console.log('Fixed TracksListPage');
