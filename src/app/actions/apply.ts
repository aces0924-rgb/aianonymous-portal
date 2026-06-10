'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getApplyConfig(eventSlug: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return null;
  const labelConfig = JSON.parse(event.labelConfig || '{}');
  return {
    lyricsTab: labelConfig.lyricsTab || 'LYRICS',
    analysisTab: labelConfig.analysisTab || '歌詞考察',
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
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
}) {
  try {
    // Basic validation
    if (!formData.title?.trim() || !formData.songUrl?.trim() || !formData.agreedToTerms || !formData.artistName?.trim()) {
      return { success: false, error: '必須項目が不足しています。' }
    }

    const isYouTube = formData.songUrl.match(/(?:youtu\.be\/|youtube\.com\/)/);
    const isNico = formData.songUrl.match(/(?:nicovideo\.jp\/|nico\.ms\/)/);
    if (!isYouTube && !isNico) {
      return { success: false, error: '楽曲URLはYouTubeまたはニコニコ動画のURLのみ有効です。' }
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
    
    const trackCount = await prisma.track.count({
      where: { eventId: event.id }
    });
    const entryNo = entryPrefix + (trackCount + 1).toString().padStart(3, '0');

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
        artistName: formData.artistName.trim(),
        xAccount: formData.xAccount.trim() || null,
        email: formData.email.trim() || null,
        genre: formData.genre.trim() || null,
        publishConsent: formData.publishConsent ? 'Yes' : 'No',
        agreedToTerms: formData.agreedToTerms ? 'Yes' : 'No',
        published: false,
      }
    });

    revalidatePath(`/${eventSlug}/admin/tracks`);
    
    return { success: true, trackId: track.id }
  } catch (error) {
    console.error('Error submitting application:', error)
    return { success: false, error: 'システムエラーが発生しました。' }
  }
}
