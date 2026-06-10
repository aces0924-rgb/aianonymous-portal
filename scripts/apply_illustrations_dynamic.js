const fs = require('fs');
let content = fs.readFileSync('src/app/[eventSlug]/selections/illustrations/page.tsx', 'utf-8');

// Add params
content = content.replace(
  "export default async function IllustrationSelectionsIndexPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {",
  `import { notFound } from 'next/navigation';\nexport default async function IllustrationSelectionsIndexPage({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ preview?: string }> }) {`
);

content = content.replace(
  "const { preview } = await searchParams;",
  `const resolvedParams = await params;\n  const { eventSlug } = resolvedParams;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return notFound();\n  const { preview } = await searchParams;`
);

// Dynamic label and theme config
content = content.replace(
  "const previewQuery = isPreview ? '?preview=honban' : '';",
  `const previewQuery = isPreview ? '?preview=honban' : '';
  const themeConfig = JSON.parse(event.themeConfig || '{}');
  const labelConfig = JSON.parse(event.labelConfig || '{}');
  const defaultTheme = {
    logoUrl: themeConfig.logoUrl || '/images/logo.png'
  };
  const defaultLabels = {
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
  };`
);

// Fix links to include eventSlug
content = content.replace(
  /<Link href=\{\`\/\$\{previewQuery\}\`\}/g,
  `<Link href={\`/\${eventSlug}\${previewQuery}\`}`
);
content = content.replace(
  /href=\{\`\/selections\$\{previewQuery\}\`\}/g,
  `href={\`/\${eventSlug}/selections\${previewQuery}\`}`
);

// Filter by eventId
content = content.replace(
  "prisma.userIllustrationPlaylist.findMany({",
  "prisma.userIllustrationPlaylist.findMany({ where: { eventId: event.id },"
);

// Footer logo and title
content = content.replace(
  /<Image[\s\S]*?src="\/images\/logo\.png"[\s\S]*?alt="Logo"[\s\S]*?width=\{128\}[\s\S]*?height=\{50\}[\s\S]*?className="w-32 mx-auto opacity-30 grayscale"[\s\S]*?style=\{\{ mixBlendMode: 'screen' \}\}[\s\S]*?\/>/,
  `<img src={defaultTheme.logoUrl} alt="Logo" className="w-32 mx-auto opacity-30 grayscale" style={{ mixBlendMode: 'screen', objectFit: 'contain' }} />`
);
content = content.replace(
  /© 2026 AI-ANONYMOUS MUSIC FES\./g,
  `© {new Date().getFullYear()} {defaultLabels.siteTitle}`
);

fs.writeFileSync('src/app/[eventSlug]/selections/illustrations/page.tsx', content);
console.log('selections/illustrations/page.tsx dynamically refactored.');
