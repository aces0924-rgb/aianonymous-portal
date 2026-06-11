'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function addAdminUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const eventId = formData.get('eventId') as string
  if (!email || !password) return
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  await prisma.adminUser.create({
    data: { 
      email, 
      password: hashedPassword,
      eventId: eventId ? eventId : null
    }
  })
  revalidatePath('/admin')
}

export async function deleteAdminUser(id: string) {
  await prisma.adminUser.delete({ where: { id } })
  revalidatePath('/admin')
}

export async function addEvent(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  if (!title || !slug) return
  
  await prisma.event.create({
    data: { 
      title, 
      slug
    }
  })
  revalidatePath('/admin')
}

export async function toggleAwardPublication(id: number, isPublished: boolean) {
  await prisma.award.update({
    where: { id },
    data: { isPublished }
  });
  revalidatePath('/admin/awards');
}

export async function updateApplyButtonSetting() {}
export async function updateCTAButtonMode() {}
export async function deleteTrack() {}
export async function deleteAllTracks() {}
export async function syncHonbanToSample() {}
export async function updateActiveTrackTable() {}

