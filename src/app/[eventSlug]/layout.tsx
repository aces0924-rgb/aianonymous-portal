import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FavoritesProvider } from "@/context/FavoritesContext";
import { PlayerProvider } from "@/context/PlayerContext";
import GlobalPlayer from "@/components/GlobalPlayer";
import LiveBroadcastBanner from "@/components/LiveBroadcastBanner";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ eventSlug: string }>
}) {
  const { eventSlug } = await params
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } })
  
  if (!event) {
    return <>{children}</>
  }

  const themeConfig = JSON.parse(event.themeConfig || '{}')
  const defaultFeatures = typeof event.defaultFeatures === 'string' ? JSON.parse(event.defaultFeatures) : (event.defaultFeatures || {})
  const isArtistMainEnabled = defaultFeatures.enableArtistMain === true

  const mainColor = themeConfig.mainColor || '#00f0ff'
  const bgColor = themeConfig.bgColor || '#000000'
  const textColor = themeConfig.textColor || '#ffffff'
  const surfaceColor = themeConfig.surfaceColor || '#111827' // gray-900
  const enableNeon = themeConfig.enableNeon !== false // true by default
  const glowColor = enableNeon ? mainColor : 'transparent'
  const baseFontSize = themeConfig.baseFontSize || 16
  const bgEffect = themeConfig.bgEffect || 'none'
  const uiTexture = themeConfig.uiTexture || 'solid'
  const cornerStyle = themeConfig.cornerStyle || 'rounded'

  const getOutlineShadow = (colorStr: string) => {
    let hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  };
  const outlineShadow = getOutlineShadow(textColor);

  return (
    <div
      style={{
        '--color-cyan-300': mainColor,
        '--color-cyan-400': mainColor,
        '--color-cyan-500': mainColor,
        '--color-cyan-600': mainColor,
        '--color-cyan-950': mainColor + '40', // 25% opacity for backgrounds
        '--background': bgColor,
        '--foreground': textColor,
        '--surface': surfaceColor,
        '--surface-border': surfaceColor, // Add this if you want border to match surface, or leave out
        '--glow': glowColor,
        '--outline-shadow': outlineShadow,
        // Also keep the color versions for backwards compatibility if needed
        '--color-background': bgColor,
        '--color-foreground': textColor,
        '--color-surface': surfaceColor,
        '--color-glow': glowColor,
      } as React.CSSProperties}
      className={`contents ${enableNeon ? 'theme-neon-enabled' : 'theme-neon-disabled'} theme-bg-${bgEffect} theme-ui-${uiTexture} theme-corner-${cornerStyle}`}
    >
      <style dangerouslySetInnerHTML={{ __html: `html { font-size: ${baseFontSize}px !important; }` }} />
      <PlayerProvider>
        <FavoritesProvider enableArtistMain={isArtistMainEnabled}>
          <LiveBroadcastBanner />
          {children}
          <GlobalPlayer />
        </FavoritesProvider>
      </PlayerProvider>
    </div>
  )
}
