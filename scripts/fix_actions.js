const fs = require('fs');
const path = require('path');

const actionsPath = 'src/app/recommend/actions.ts';
let c = fs.readFileSync(actionsPath, 'utf8');

// 1. registerPlaylist
c = c.replace(
  `export async function registerPlaylist(userName: string, trackIds: string, xAccountId?: string, appeal?: string): Promise<RegistrationResult> {`,
  `export async function registerPlaylist(eventSlug: string, userName: string, trackIds: string, xAccountId?: string, appeal?: string): Promise<RegistrationResult> {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return { success: false, error: 'Event not found' };`
);

// Fix setting queries inside registerPlaylist
c = c.replace(
  `const activeTableSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_TRACK_TABLE' } })`,
  `const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } })`
);

c = c.replace(
  `const mainEntry = await prisma.userPlaylist.findUnique({
      where: { userName: trimmedName }
    });`,
  `const mainEntry = await prisma.userPlaylist.findFirst({
      where: { eventId: event.id, userName: trimmedName }
    });`
);

c = c.replace(
  `const subEntries = await (prisma as any).userPlaylistSub.findMany({
      where: { userName: trimmedName },`,
  `const subEntries = await (prisma as any).userPlaylistSub.findMany({
      where: { eventId: event.id, userName: trimmedName },`
);

c = c.replace(
  `      // 新規の場合はメインテーブルに保存
      newPlaylist = await prisma.userPlaylist.create({
        data: {
          userName: trimmedName,`,
  `      // 新規の場合はメインテーブルに保存
      newPlaylist = await prisma.userPlaylist.create({
        data: {
          eventId: event.id,
          userName: trimmedName,`
);

c = c.replace(
  `      // 既にメインにある場合はサブテーブルに保存
      newPlaylist = await (prisma as any).userPlaylistSub.create({
        data: {
          userName: trimmedName,`,
  `      // 既にメインにある場合はサブテーブルに保存
      newPlaylist = await (prisma as any).userPlaylistSub.create({
        data: {
          eventId: event.id,
          userName: trimmedName,`
);

c = c.replace(
  `const allPlaylists = await prisma.userPlaylist.findMany({ select: { id: true, trackIds: true } });`,
  `const allPlaylists = await prisma.userPlaylist.findMany({ where: { eventId: event.id }, select: { id: true, trackIds: true } });`
);

c = c.replace(
  `const allSubPlaylists = await (prisma as any).userPlaylistSub.findMany({ select: { id: true, trackIds: true } });`,
  `const allSubPlaylists = await (prisma as any).userPlaylistSub.findMany({ where: { eventId: event.id }, select: { id: true, trackIds: true } });`
);

c = c.replace(
  `const thresholdSetting = await (prisma as any).setting.findUnique({ where: { key: 'CELEBRATION_THRESHOLD' } });`,
  `const thresholdSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'CELEBRATION_THRESHOLD' } } });`
);

// 2. getPlaylistByUserName
c = c.replace(
  `export async function getPlaylistByUserName(userName: string) {`,
  `export async function getPlaylistByUserName(eventSlug: string, userName: string) {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return null;`
);

c = c.replace(
  `  return await prisma.userPlaylist.findUnique({
    where: { userName }
  });`,
  `  return await prisma.userPlaylist.findFirst({
    where: { eventId: event.id, userName }
  });`
);

// 3. getTrackTitlesByIds
c = c.replace(
  `export async function getTrackTitlesByIds(ids: number[]) {`,
  `export async function getTrackTitlesByIds(eventSlug: string, ids: number[]) {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return [];`
);

c = c.replace(
  `const activeTableSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_TRACK_TABLE' } })`,
  `const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } })`
);

// 4. getRegistrationCount
c = c.replace(
  `export async function getRegistrationCount(userName: string): Promise<number> {`,
  `export async function getRegistrationCount(eventSlug: string, userName: string): Promise<number> {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return 0;`
);

c = c.replace(
  `    const mainEntry = await prisma.userPlaylist.findUnique({
      where: { userName: trimmedName }
    });`,
  `    const mainEntry = await prisma.userPlaylist.findFirst({
      where: { eventId: event.id, userName: trimmedName }
    });`
);

c = c.replace(
  `    const subEntriesCount = await (prisma as any).userPlaylistSub.count({
      where: { userName: trimmedName }
    });`,
  `    const subEntriesCount = await (prisma as any).userPlaylistSub.count({
      where: { eventId: event.id, userName: trimmedName }
    });`
);

// 5. getMaxIllustLimit
c = c.replace(
  `export async function getMaxIllustLimit(): Promise<number> {`,
  `export async function getMaxIllustLimit(eventSlug: string): Promise<number> {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return 3;`
);

c = c.replace(
  `const limitSetting = await prisma.setting.findUnique({ where: { key: 'MAX_ILLUST_RECOMMEND_LIMIT' } });`,
  `const limitSetting = await prisma.setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'MAX_ILLUST_RECOMMEND_LIMIT' } } });`
);

// 6. getEnableIllustRecommend
c = c.replace(
  `export async function getEnableIllustRecommend(): Promise<boolean> {`,
  `export async function getEnableIllustRecommend(eventSlug: string): Promise<boolean> {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return false;`
);

c = c.replace(
  `const setting = await prisma.setting.findUnique({ where: { key: 'ENABLE_ILLUST_RECOMMEND' } });`,
  `const setting = await prisma.setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ENABLE_ILLUST_RECOMMEND' } } });`
);

// 7. getIllustrationRegistrationCount
c = c.replace(
  `export async function getIllustrationRegistrationCount(userName: string): Promise<number> {`,
  `export async function getIllustrationRegistrationCount(eventSlug: string, userName: string): Promise<number> {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return 0;`
);

c = c.replace(
  `    const entries = await prisma.userIllustrationPlaylist.findMany({
      where: { userName: trimmedName }
    });`,
  `    const entries = await prisma.userIllustrationPlaylist.findMany({
      where: { eventId: event.id, userName: trimmedName }
    });`
);

// 8. registerIllustrationPlaylist
c = c.replace(
  `export async function registerIllustrationPlaylist(userName: string, trackIds: string, xAccountId?: string, appeal?: string): Promise<RegistrationResult> {`,
  `export async function registerIllustrationPlaylist(eventSlug: string, userName: string, trackIds: string, xAccountId?: string, appeal?: string): Promise<RegistrationResult> {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return { success: false, error: 'Event not found' };`
);

c = c.replace(
  `const maxLimit = await getMaxIllustLimit();`,
  `const maxLimit = await getMaxIllustLimit(eventSlug);`
);

c = c.replace(
  `const currentCount = await getIllustrationRegistrationCount(trimmedName);`,
  `const currentCount = await getIllustrationRegistrationCount(eventSlug, trimmedName);`
);

c = c.replace(
  `const activeTableSetting = await prisma.setting.findUnique({ where: { key: 'ACTIVE_TRACK_TABLE' } });`,
  `const activeTableSetting = await prisma.setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } });`
);

c = c.replace(
  `const previousEntries = await prisma.userIllustrationPlaylist.findMany({
      where: { userName: trimmedName }
    });`,
  `const previousEntries = await prisma.userIllustrationPlaylist.findMany({
      where: { eventId: event.id, userName: trimmedName }
    });`
);

c = c.replace(
  `    const newPlaylist = await prisma.userIllustrationPlaylist.create({
      data: {
        userName: trimmedName,`,
  `    const newPlaylist = await prisma.userIllustrationPlaylist.create({
      data: {
        eventId: event.id,
        userName: trimmedName,`
);

// 9. getAllPlaylistsByUserName
c = c.replace(
  `export async function getAllPlaylistsByUserName(userName: string) {`,
  `export async function getAllPlaylistsByUserName(eventSlug: string, userName: string) {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return [];`
);

c = c.replace(
  `    const main = await prisma.userPlaylist.findMany({
      where: { userName },`,
  `    const main = await prisma.userPlaylist.findMany({
      where: { eventId: event.id, userName },`
);

c = c.replace(
  `    const sub = await (prisma as any).userPlaylistSub.findMany({
      where: { userName },`,
  `    const sub = await (prisma as any).userPlaylistSub.findMany({
      where: { eventId: event.id, userName },`
);

// 10. getAllIllustrationPlaylistsByUserName
c = c.replace(
  `export async function getAllIllustrationPlaylistsByUserName(userName: string) {`,
  `export async function getAllIllustrationPlaylistsByUserName(eventSlug: string, userName: string) {\n  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });\n  if (!event) return [];`
);

c = c.replace(
  `    return await prisma.userIllustrationPlaylist.findMany({
      where: { userName },`,
  `    return await prisma.userIllustrationPlaylist.findMany({
      where: { eventId: event.id, userName },`
);

fs.writeFileSync(actionsPath, c);
console.log('Fixed actions');
