const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findUnique({
    where: { slug: 'aisummer2026' },
    include: { settings: true }
  });
  if (!event) {
    console.log("Event not found");
    return;
  }
  console.log("Found event:", event.slug, event.title);

  const templateSettings = event.settings.filter(s =>
    ['CTA_BUTTON_MODE', 'ENABLE_ILLUST_RECOMMEND'].includes(s.key)
  ).map(s => ({ key: s.key, value: s.value }));

  const template = await prisma.eventTemplate.upsert({
    where: { name: 'アーティスト主体イベントパターン' },
    update: {
      themeConfig: event.themeConfig,
      featureFlags: event.featureFlags,
      labelConfig: '{}',
      settingsData: JSON.stringify(templateSettings)
    },
    create: {
      name: 'アーティスト主体イベントパターン',
      description: 'AISUPERLIVESUMMER2026を元にしたアーティスト主体のテンプレート',
      themeConfig: event.themeConfig,
      featureFlags: event.featureFlags,
      labelConfig: '{}',
      settingsData: JSON.stringify(templateSettings)
    }
  });
  console.log("Template created:", template.name);
}
main().catch(console.error).finally(() => prisma.$disconnect());
