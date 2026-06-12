'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getApplyConfig(eventSlug: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return null;
  const labelConfig = JSON.parse(event.labelConfig || '{}');
  const featureFlags = JSON.parse(event.featureFlags || '{}');
  return {
    lyricsTab: labelConfig.lyricsTab || 'LYRICS',
    analysisTab: labelConfig.analysisTab || '歌詞考察',
    analysisNote: labelConfig.analysisNote || '',
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
    applicationFormType: featureFlags.applicationFormType || 'standard',
    enableArtistMain: featureFlags.enableArtistMain ?? false,
  };
}

function generateRandomAlphabets(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function submitApplication(eventSlug: string, formData: {
  title: string;
  songUrl: string;
  lyrics: string;
  analysis: string;
  artistName: string;
  xAccount: string;
  email: string;
  genre: string;
  publishConsent: boolean;
  agreedToTerms: boolean;
  password?: string;
  musicFileUrl?: string;
  srtFileUrl?: string;
}) {
  try {
    // Basic validation
    if (!formData.title?.trim() || !formData.songUrl?.trim()) {
      return { success: false, error: '必須項目が不足しています。' }
    }

    if (!formData.songUrl.match(/^https?:\/\//)) {
      return { success: false, error: '正しいURLを入力してください。' }
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug }
    });

    if (!event) {
      return { success: false, error: 'イベントが見つかりません。' }
    }

    const labelConfig = JSON.parse(event.labelConfig || '{}');
    const entryPrefix = (labelConfig.entryPrefix || 'ANF').toUpperCase().substring(0, 3);
    
    const existingTracks = await prisma.track.findMany({
      where: { eventId: event.id },
      select: { entryNo: true }
    });
    
    let maxNumber = 0;
    for (const t of existingTracks) {
      if (t.entryNo) {
        const match = t.entryNo.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    
    const entryNo = entryPrefix + (maxNumber + 1).toString().padStart(3, '0');

    // Insert into Track table
    const track = await prisma.track.create({
      data: {
        eventId: event.id,
        timestamp: new Date().toISOString(), // unique timestamp
        entryNo: entryNo,
        title: formData.title.trim(),
        songUrl: formData.songUrl.trim(),
        audioUrl: formData.songUrl.trim(),
        lyrics: formData.lyrics.trim() || null,
        analysis: formData.analysis.trim() || null,
        artistName: formData.artistName.trim() || '匿名',
        xAccount: formData.xAccount.trim() || null,
        email: formData.email.trim() || null,
        genre: formData.genre.trim() || null,
        publishConsent: formData.publishConsent ? 'Yes' : 'No',
        agreedToTerms: formData.agreedToTerms ? 'Yes' : 'No',
        published: false,
        password: formData.password?.trim() || null,
        musicFileUrl: formData.musicFileUrl?.trim() || null,
        srtFileUrl: formData.srtFileUrl?.trim() || null,
      }
    });

    revalidatePath(`/${eventSlug}/admin/tracks`);
    
    return { success: true, trackId: track.id }
  } catch (error) {
    console.error('Error submitting application:', error)
    return { success: false, error: 'システムエラーが発生しました。' }
  }
}
