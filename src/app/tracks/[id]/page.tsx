import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function LegacyTrackRedirect({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const trackId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(trackId)) {
    redirect('/');
  }

  // Try to find the track to get its eventId
  let track = await prisma.track.findUnique({ where: { id: trackId }, include: { event: true } });
  if (!track) {
    track = await (prisma as any).trackHonban.findUnique({ where: { id: trackId }, include: { event: true } });
  }

  if (track && track.event && track.event.slug) {
    redirect(`/${track.event.slug}/tracks/${track.id}`);
  } else {
    // Fallback if track not found or event not found
    const firstEvent = await prisma.event.findFirst();
    if (firstEvent) {
      redirect(`/${firstEvent.slug}/tracks/${trackId}`);
    } else {
      redirect('/');
    }
  }
}
