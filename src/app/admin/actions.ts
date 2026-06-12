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

export async function getEventTemplates() {
  return await prisma.eventTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function addEvent(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const templateIdStr = formData.get('templateId') as string
  if (!title || !slug) return
  
  let themeConfig = "{}"
  let featureFlags = "{}"
  let settingsData: {key: string, value: string}[] = []

  if (templateIdStr) {
    const templateId = parseInt(templateIdStr, 10)
    const template = await prisma.eventTemplate.findUnique({ where: { id: templateId } })
    if (template) {
      themeConfig = template.themeConfig
      featureFlags = template.featureFlags
      try {
        settingsData = JSON.parse(template.settingsData)
      } catch (e) { console.error(e) }
    }
  }

  const event = await prisma.event.create({
    data: { 
      title, 
      slug,
      themeConfig,
      featureFlags
    }
  })

  if (settingsData && settingsData.length > 0) {
    await Promise.all(settingsData.map(s => 
      prisma.setting.create({
        data: { eventId: event.id, key: s.key, value: s.value }
      })
    ))
  }

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

