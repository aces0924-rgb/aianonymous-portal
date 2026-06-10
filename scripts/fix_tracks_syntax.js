const fs = require('fs');

let pagePath = 'src/app/[eventSlug]/tracks/page.tsx';
let c = fs.readFileSync(pagePath, 'utf-8');

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

fs.writeFileSync(pagePath, c);
console.log('Fixed TracksListPage syntax properly');
