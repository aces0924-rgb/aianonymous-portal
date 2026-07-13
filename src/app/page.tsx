import Image from "next/image";
import prisma from "@/lib/prisma";
import PortalHomeExplorer from "@/components/PortalHomeExplorer";

export const dynamic = 'force-dynamic';

export default async function PortalHome() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      schedules: { orderBy: { order: 'asc' } },
    },
  });

  const globalSettings = await prisma.globalSetting.findMany();
  const settingsMap = globalSettings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  const portalBgUrl = settingsMap['portal_bg_url'] || "https://i.gyazo.com/3d88429640b885cb595bc0c3756007d6.jpg";
  const portalLogoUrl = settingsMap['portal_logo_url'] || "https://i.gyazo.com/2d95ce2d1f241232b192d53bc4dd4fd4.png";
  const portalLogoWidth = settingsMap['portal_logo_width'];
  const portalArchiveUrl = settingsMap['portal_archive_url'] ?? "https://aianonymous.vercel.app/";
  const eventCalendarUrl = "https://script.google.com/macros/s/AKfycbxEFXYDzYnK9T8AOwWISFoBfXcTYLz2WuKdBTjQ1hW_DLvawgLub6_YG-yoezmCCcuibw/exec";

  const serializedEvents = events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    themeConfig: event.themeConfig,
    featureFlags: event.featureFlags,
    labelConfig: event.labelConfig,
    createdAt: event.createdAt.toISOString(),
    schedules: event.schedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      date: schedule.date,
      order: schedule.order,
    })),
  }));

  return (
    <main className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={portalBgUrl}
          alt="Portal Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
      </div>
      <div className="fixed inset-0 z-0 bg-white/10 backdrop-blur-[3px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto pt-8 pb-16 px-4">
        <PortalHomeExplorer
          events={serializedEvents}
          portalLogoUrl={portalLogoUrl}
          portalLogoWidth={portalLogoWidth}
          portalArchiveUrl={portalArchiveUrl}
          eventCalendarUrl={eventCalendarUrl}
        />
      </div>
    </main>
  );
}
