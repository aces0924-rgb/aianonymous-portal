'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function checkAdmin(eventId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  const adminIdCookie = cookieStore.get('admin_id');

  if (session?.value !== 'true' || !adminIdCookie) {
    throw new Error('Unauthorized');
  }

  const adminId = adminIdCookie.value;
  if (adminId !== 'global') {
    const adminUser = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!adminUser || (adminUser.eventId && adminUser.eventId !== eventId)) {
      throw new Error('Unauthorized');
    }
  }
}

export async function addPremiereSchedule(eventId: string, formData: FormData) {
  await checkAdmin(eventId);
  
  const day = parseInt(formData.get('day') as string);
  const dateStr = formData.get('date') as string;
  const date = new Date(dateStr);
  const youtubeUrl = formData.get('youtubeUrl') as string || null;
  const trackRange = formData.get('trackRange') as string;
  const trackCount = parseInt(formData.get('trackCount') as string);
  const remarks = formData.get('remarks') as string || null;
  const thumbnailDriveId = formData.get('thumbnailDriveId') as string || null;
  const isPublic = formData.get('isPublic') === 'true';
  const acceptsThumbnail = formData.get('acceptsThumbnail') === 'true';

  await prisma.premiereSchedule.create({
    data: {
      eventId,
      day,
      date,
      youtubeUrl,
      trackRange,
      trackCount,
      remarks,
      thumbnailDriveId,
      isPublic,
      acceptsThumbnail
    }
  });

  revalidatePath(`/admin/events/${eventId}/premiere`);
}

export async function updatePremiereSchedule(eventId: string, id: number, formData: FormData) {
  await checkAdmin(eventId);

  const day = parseInt(formData.get('day') as string);
  const dateStr = formData.get('date') as string;
  const date = new Date(dateStr);
  const youtubeUrl = formData.get('youtubeUrl') as string || null;
  const trackRange = formData.get('trackRange') as string;
  const trackCount = parseInt(formData.get('trackCount') as string);
  const remarks = formData.get('remarks') as string || null;
  const thumbnailDriveId = formData.get('thumbnailDriveId') as string || null;
  const isPublic = formData.get('isPublic') === 'true';
  const acceptsThumbnail = formData.get('acceptsThumbnail') === 'true';

  await prisma.premiereSchedule.update({
    where: { id },
    data: {
      day,
      date,
      youtubeUrl,
      trackRange,
      trackCount,
      remarks,
      thumbnailDriveId,
      isPublic,
      acceptsThumbnail
    }
  });

  revalidatePath(`/admin/events/${eventId}/premiere`);
}

export async function deletePremiereSchedule(eventId: string, id: number) {
  await checkAdmin(eventId);

  await prisma.premiereSchedule.delete({
    where: { id }
  });

  revalidatePath(`/admin/events/${eventId}/premiere`);
}

export async function updateTimetableUrl(eventId: string, formData: FormData) {
  await checkAdmin(eventId);

  const url = formData.get('timetableUrl') as string;

  if (url) {
    await prisma.setting.upsert({
      where: {
        eventId_key: {
          eventId,
          key: 'timetableUrl'
        }
      },
      update: {
        value: url
      },
      create: {
        eventId,
        key: 'timetableUrl',
        value: url
      }
    });
  } else {
    // If empty, delete the setting
    try {
      await prisma.setting.delete({
        where: {
          eventId_key: {
            eventId,
            key: 'timetableUrl'
          }
        }
      });
    } catch (e) {
      // ignore if it doesn't exist
    }
  }

  revalidatePath(`/admin/events/${eventId}/premiere`);
  revalidatePath(`/${eventId}/schedule`);
}
