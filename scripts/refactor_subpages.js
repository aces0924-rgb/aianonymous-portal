const fs = require('fs');
const path = require('path');

// --- 1. tracks/[id]/page.tsx ---
const trackPage = path.join(__dirname, '../src/app/[eventSlug]/tracks/[id]/page.tsx');
if (fs.existsSync(trackPage)) {
  let trackContent = fs.readFileSync(trackPage, 'utf-8');
  trackContent = trackContent.replace(
    `params: Promise<{ id: string }>,`,
    `params: Promise<{ eventSlug: string, id: string }>,`
  );
  trackContent = trackContent.replace(
    `const resolvedParams = await params;`,
    `const resolvedParams = await params;\n  const { eventSlug } = resolvedParams;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return notFound();`
  );
  trackContent = trackContent.replace(
    `await prisma.trackHonban.findUnique({ where: { id: trackId } })`,
    `await prisma.trackHonban.findFirst({ where: { id: trackId, eventId: event.id } })`
  );
  trackContent = trackContent.replace(
    `await prisma.track.findUnique({ where: { id: trackId } })`,
    `await prisma.track.findFirst({ where: { id: trackId, eventId: event.id } })`
  );
  trackContent = trackContent.replace(
    `where: { published: true },`,
    `where: { eventId: event.id, published: true },`
  );
  trackContent = trackContent.replace(
    `where: { published: true },`,
    `where: { eventId: event.id, published: true },`
  );
  trackContent = trackContent.replace(
    `const tracksListUrl = preview === 'honban' ? '/tracks?preview=honban' : '/tracks';`,
    `const tracksListUrl = preview === 'honban' ? \`/\${eventSlug}/tracks?preview=honban\` : \`/\${eventSlug}/tracks\`;`
  );
  trackContent = trackContent.replace(
    `/tracks/\${(prevTrack as any).id}`,
    `/\${eventSlug}/tracks/\${(prevTrack as any).id}`
  );
  trackContent = trackContent.replace(
    `/tracks/\${(nextTrack as any).id}`,
    `/\${eventSlug}/tracks/\${(nextTrack as any).id}`
  );
  trackContent = trackContent.replace(
    `/submit-thumbnail?trackId=\${track.id}`,
    `/\${eventSlug}/submit-thumbnail?trackId=\${track.id}`
  );
  fs.writeFileSync(trackPage, trackContent);
  console.log('Updated tracks/[id]/page.tsx');
}

// --- 2. awards/preview/page.tsx ---
const awardPage = path.join(__dirname, '../src/app/[eventSlug]/awards/preview/page.tsx');
if (fs.existsSync(awardPage)) {
  let awardContent = fs.readFileSync(awardPage, 'utf-8');
  awardContent = awardContent.replace(
    `export default async function AwardsPreviewPage() {`,
    `import { notFound } from "next/navigation";\n\nexport default async function AwardsPreviewPage({ params }: { params: Promise<{ eventSlug: string }> }) {\n  const { eventSlug } = await params;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) notFound();`
  );
  awardContent = awardContent.replace(
    `where: { published: true },`,
    `where: { eventId: event.id, published: true },`
  );
  awardContent = awardContent.replace(
    `where: { published: true },`,
    `where: { eventId: event.id, published: true },`
  );
  awardContent = awardContent.replace(
    `Link href="/"`,
    `Link href={\`/\${eventSlug}\`}`
  );
  fs.writeFileSync(awardPage, awardContent);
  console.log('Updated awards/preview/page.tsx');
}

// --- 3. schedule/page.tsx ---
const schedulePage = path.join(__dirname, '../src/app/[eventSlug]/schedule/page.tsx');
if (fs.existsSync(schedulePage)) {
  let scheduleContent = fs.readFileSync(schedulePage, 'utf-8');
  scheduleContent = scheduleContent.replace(
    `export default async function SchedulePage() {`,
    `import { notFound } from "next/navigation";\n\nexport default async function SchedulePage({ params }: { params: Promise<{ eventSlug: string }> }) {\n  const { eventSlug } = await params;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) notFound();`
  );
  scheduleContent = scheduleContent.replace(
    `const schedule = await prisma.schedule.findMany({ orderBy: { order: 'asc' } })`,
    `const schedule = await prisma.schedule.findMany({ where: { eventId: event.id }, orderBy: { order: 'asc' } })`
  );
  scheduleContent = scheduleContent.replace(
    `href="/"`,
    `href={\`/\${eventSlug}\`}`
  );
  fs.writeFileSync(schedulePage, scheduleContent);
  console.log('Updated schedule/page.tsx');
}

// --- 4. submit-thumbnail/page.tsx ---
const submitPage = path.join(__dirname, '../src/app/[eventSlug]/submit-thumbnail/page.tsx');
if (fs.existsSync(submitPage)) {
  let submitContent = fs.readFileSync(submitPage, 'utf-8');
  submitContent = submitContent.replace(
    `export default async function SubmitThumbnailPage({ searchParams }: { searchParams: Promise<{ trackId?: string, preview?: string }> }) {`,
    `import { notFound } from "next/navigation";\n\nexport default async function SubmitThumbnailPage({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ trackId?: string, preview?: string }> }) {\n  const { eventSlug } = await params;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) notFound();`
  );
  submitContent = submitContent.replace(
    `href="/tracks"`,
    `href={\`/\${eventSlug}/tracks\`}`
  );
  fs.writeFileSync(submitPage, submitContent);
  console.log('Updated submit-thumbnail/page.tsx');
}

// --- 5. selections/page.tsx ---
const selPage = path.join(__dirname, '../src/app/[eventSlug]/selections/page.tsx');
if (fs.existsSync(selPage)) {
  let selContent = fs.readFileSync(selPage, 'utf-8');
  selContent = selContent.replace(
    `export default async function SelectionsPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {`,
    `import { notFound } from 'next/navigation';\nexport default async function SelectionsPage({ params, searchParams }: { params: Promise<{ eventSlug: string }>, searchParams: Promise<{ preview?: string }> }) {\n  const { eventSlug } = await params;\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) notFound();`
  );
  selContent = selContent.replace(
    `where: { status: 'APPROVED' }`,
    `where: { status: 'APPROVED', eventId: event.id }`
  );
  selContent = selContent.replace(
    `where: { status: 'APPROVED' }`,
    `where: { status: 'APPROVED', eventId: event.id }`
  );
  selContent = selContent.replace(
    `href="/"`,
    `href={\`/\${eventSlug}\`}`
  );
  fs.writeFileSync(selPage, selContent);
  console.log('Updated selections/page.tsx');
}
