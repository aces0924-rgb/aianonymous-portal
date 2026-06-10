import React from 'react';
import prisma from '@/lib/prisma';
import LiveBroadcastClient from './LiveBroadcastClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveBroadcastBanner() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

  const liveEvent = await prisma.premiereSchedule.findFirst({
    where: {
      isPublic: true,
      date: {
        lte: now,
        gte: oneHourAgo,
      },
    },
  });

  if (!liveEvent) return null;

  return <LiveBroadcastClient liveEvent={liveEvent} />;
}
