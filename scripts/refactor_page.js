const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/[eventSlug]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

// Update signature
content = content.replace(
  `export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {`,
  `import { notFound } from "next/navigation";\n\nexport default async function Home({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ preview?: string }> }) {\n  const { eventSlug } = await params;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) notFound();`
);

// Add eventId to queries
content = content.replace(
  `const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } })`,
  `const news = await prisma.news.findMany({ where: { eventId: event.id }, orderBy: { createdAt: 'desc' } })`
);
content = content.replace(
  `const schedule = await prisma.schedule.findMany({ orderBy: { order: 'asc' } })`,
  `const schedule = await prisma.schedule.findMany({ where: { eventId: event.id }, orderBy: { order: 'asc' } })`
);
content = content.replace(
  `const faqs = await (prisma as any).faq.findMany({ orderBy: { order: 'asc' } })`,
  `const faqs = await (prisma as any).faq.findMany({ where: { eventId: event.id }, orderBy: { order: 'asc' } })`
);

content = content.replace(
  `where: { published: true },`,
  `where: { eventId: event.id, published: true },`
);
content = content.replace(
  `where: { published: true },`,
  `where: { eventId: event.id, published: true },`
);

// Update Links
content = content.replace(`href: '/awards/preview'`, `href: \`/\${eventSlug}/awards/preview\``);
content = content.replace(`href: '/tracks'`, `href: \`/\${eventSlug}/tracks\``);
content = content.replace(`href: '/selections'`, `href: \`/\${eventSlug}/selections\``);
content = content.replace(`href="/schedule"`, `href={\`/\${eventSlug}/schedule\`}`);
content = content.replace(`href="/tracks"`, `href={\`/\${eventSlug}/tracks\`}`);

fs.writeFileSync(pagePath, content);
console.log('Refactored page.tsx');
