'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import Papa from 'papaparse'

// === 基本情報 ===
export async function updateEventDetails(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const slug = formData.get('slug') as string
  const guidelinesTitle = formData.get('guidelinesTitle') as string

  if (!title || !slug) return

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return

  const labelConfig = JSON.parse(event.labelConfig || '{}')
  if (guidelinesTitle !== undefined) {
    labelConfig.guidelinesTitle = guidelinesTitle
  }

  await prisma.event.update({
    where: { id },
    data: { 
      title, 
      description, 
      slug,
      labelConfig: JSON.stringify(labelConfig)
    }
  })
  revalidatePath('/admin')
  revalidatePath(`/${slug}`, 'layout')
}

// === 設定 (Settings) ===
export async function saveEventSetting(eventId: string, key: string, value: string) {
  await prisma.setting.upsert({
    where: { eventId_key: { eventId, key } },
    update: { value },
    create: { eventId, key, value }
  })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function updateEventSetting(eventId: string, key: string, formData: FormData) {
  const value = formData.get('value') as string
  if (value === null || value === undefined) return
  await saveEventSetting(eventId, key, value)
}

// === デザイン・機能・ラベル設定 (JSON Configs) ===
export async function updateEventConfig(id: string, configType: 'themeConfig' | 'featureFlags' | 'labelConfig', data: Record<string, any>) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return;

  const currentConfig = JSON.parse(event[configType] || '{}');
  const newConfig = { ...currentConfig, ...data };

  await prisma.event.update({
    where: { id },
    data: { [configType]: JSON.stringify(newConfig) }
  });
  revalidatePath(`/admin/events/${id}/settings`);
  revalidatePath(`/${event.slug}`, 'layout');
}

// === お知らせ (News) ===
export async function addEventNews(eventId: string, formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  if (!title) return
  await prisma.news.create({ data: { title, content, eventId } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function deleteEventNews(eventId: string, id: number) {
  await prisma.news.delete({ where: { id } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

// === スケジュール (Schedule) ===
export async function addEventSchedule(eventId: string, formData: FormData) {
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const order = parseInt(formData.get('order') as string) || 0
  if (!title || !date) return
  await prisma.schedule.create({ data: { title, date, order, eventId } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function deleteEventSchedule(eventId: string, id: number) {
  await prisma.schedule.delete({ where: { id } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

// === ルール (Rules) ===
export async function addEventRule(eventId: string, formData: FormData) {
  const content = formData.get('content') as string
  const title = formData.get('title') as string || 'タイトル'
  const icon = formData.get('icon') as string || '✨'
  const order = parseInt(formData.get('order') as string) || 0
  if (!content) return
  await prisma.rule.create({ data: { title, icon, content, order, eventId } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function deleteEventRule(eventId: string, id: number) {
  await prisma.rule.delete({ where: { id } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

// === FAQ ===
export async function addEventFaq(eventId: string, formData: FormData) {
  const question = formData.get('question') as string
  const answer = formData.get('answer') as string
  const order = parseInt(formData.get('order') as string) || 0
  if (!question || !answer) return
  await prisma.faq.create({ data: { question, answer, order, eventId } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function deleteEventFaq(eventId: string, id: number) {
  await prisma.faq.delete({ where: { id } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

// === トラック公開フラグ ===
export async function toggleEventTrackPublication(eventId: string, id: number, published: boolean) {
  await prisma.trackHonban.update({ where: { id }, data: { published } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function deleteEventTrack(eventId: string, id: number) {
  await prisma.trackHonban.delete({ where: { id } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function toggleEventDirectTrackPublication(eventId: string, id: number, published: boolean) {
  await prisma.track.update({ where: { id }, data: { published } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

export async function deleteEventDirectTrack(eventId: string, id: number) {
  await prisma.track.delete({ where: { id } })
  revalidatePath(`/admin/events/${eventId}/settings`)
}

const DEFAULT_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";

export async function syncEventTracksFromSheet(eventId: string, formData?: FormData) {
  try {
    const setting = await prisma.setting.findUnique({ where: { eventId_key: { eventId, key: 'SHEET_URL' } } });
    const sheetUrl = setting?.value || DEFAULT_SHEET_CSV_URL;
    
    const startIdStr = formData?.get('startId') as string;
    const startId = startIdStr ? parseInt(startIdStr) : 1;

    const res = await fetch(sheetUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch sheet data");
    const csvContent = await res.text();

    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    let rows = parsed.data as any[];

    const filteredRows = rows.filter(row => {
      const rowId = parseInt(row['No'] || "0");
      return rowId >= startId;
    });

    await Promise.all(
      filteredRows.map(async (row) => {
        const timestamp = row['タイムスタンプ'] || row['Timestamp'];
        if (!timestamp) return;

        const entryNo = row['No'] || "";
        const title = row['■ 曲タイトル'] || row['楽曲タイトル'] || row['title'] || "Untitled";
        const songUrl = row['youtube:URL'] || row['YouTube:URL'] || row['■ 楽曲URL'] || row['URL'] || "";
        const lyrics = row['■ 歌詞（任意）'] || row['歌詞'] || row['lyrics'] || "";
        const artistName = row['■ 公開名（アーティスト名）※公開する場合のみ'] || row['名前（ハンドルネーム）'] || row['artist'] || "";
        const xAccount = row['■ X（旧Twitter）アカウント'] || row['X（旧Twitter）アカウント'] || row['xAccount'] || "";
        const publishConsent = row['■ 企画終了後の公開について'] || row['公開の承諾'] || "";
        const email = row['■ メールアドレス（任意）'] || row['メールアドレス'] || "";
        
        const analysis = row['歌詞考察'] || "";
        const review = row['楽曲考察'] || "";
        
        let genre = "";
        if (review.includes("■ジャンル")) {
          const lines = review.split('\n');
          const genreIdx = lines.findIndex(l => l.includes("■ジャンル"));
          if (genreIdx !== -1 && lines[genreIdx+1]) {
            genre = lines[genreIdx+1].trim();
          }
        }

        const updateData: any = {
          xAccount, title, songUrl, lyrics, publishConsent, artistName, email, review, entryNo, genre, eventId
        };

        if (analysis) {
          updateData.analysis = analysis;
        }

        await prisma.trackHonban.upsert({
          where: { timestamp },
          update: updateData,
          create: {
            ...updateData,
            timestamp,
            analysis: analysis || null,
            published: false
          }
        });
      })
    );

    revalidatePath(`/admin/events/${eventId}/settings`);
    return { success: true, count: filteredRows.length };
  } catch (err: any) {
    console.error("❌ [Sync Process Failed]:", err);
    return { success: false, error: err.message };
  }
}

export async function syncOnlyEventAnalysisFromSheet(eventId: string, formData: FormData) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const folderId = process.env.GDRIVE_REVIEWS_FOLDER_ID || "19Z4bIBYNMX8DFtujAc-rcKrjG1JSXsqS";
    
    if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");

    const startIdStr = formData.get('startId') as string;
    const startId = startIdStr ? parseInt(startIdStr) : 1;

    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType = 'text/plain'`);
    const driveFilesUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=files(id,name)&pageSize=1000`;
    const driveRes = await fetch(driveFilesUrl, { cache: 'no-store' });
    if (!driveRes.ok) throw new Error(`Google Drive API (List) returned status ${driveRes.status}`);

    const driveData = await driveRes.json();
    const allFiles = driveData.files || [];
    
    const targetFiles = allFiles.filter((file: any) => {
      const match = file.name.match(/^(\d+)/);
      if (!match) return false;
      return parseInt(match[1]) >= startId;
    });

    let updateCount = 0;

    await Promise.all(
      targetFiles.map(async (file: any) => {
        const noMatch = file.name.match(/^(\d+)/);
        if (!noMatch) return;
        
        const rawNo = noMatch[1];
        const normalizedNo = rawNo.padStart(3, '0');
        
        const contentUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`;
        
        try {
          const contentRes = await fetch(contentUrl, { cache: 'no-store' });
          if (!contentRes.ok) return;
          
          const rawText = await contentRes.text();
          if (!rawText) return;

          let genre = "";
          let cleanReview = rawText;

          if (rawText.includes("■ジャンル")) {
            const lines = rawText.split('\n');
            const genreIdx = lines.findIndex(l => l.includes("■ジャンル"));
            if (genreIdx !== -1 && lines[genreIdx+1]) {
              genre = lines[genreIdx+1].trim();
            }
          }

          if (rawText.includes("■楽曲考察")) {
            const parts = rawText.split("■楽曲考察");
            if (parts.length > 1) {
              cleanReview = parts[1].trim();
            }
          }

          const result = await prisma.trackHonban.updateMany({
            where: { entryNo: normalizedNo, eventId },
            data: { review: cleanReview, genre: genre || undefined }
          });
          
          if (result.count > 0) updateCount++;
        } catch (fileErr) {
          console.error(`❌ [Drive Review Sync] No.${normalizedNo} の同期中にエラー:`, fileErr);
        }
      })
    );

    revalidatePath(`/admin/events/${eventId}/settings`);
    return { success: true, count: updateCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// === テンプレート ===
export async function createTemplateFromEvent(eventId: string, templateName: string) {
  if (!templateName) return { success: false, error: 'テンプレート名が空です。' };
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { settings: true } });
    if (!event) return { success: false, error: 'イベントが見つかりません。' };

    const templateSettings = event.settings.filter((s: any) =>
      ['CTA_BUTTON_MODE', 'ENABLE_ILLUST_RECOMMEND'].includes(s.key)
    ).map((s: any) => ({ key: s.key, value: s.value }));

    await prisma.eventTemplate.upsert({
      where: { name: templateName },
      update: {
        themeConfig: event.themeConfig,
        featureFlags: event.featureFlags,
        labelConfig: '{}', // 文言等はコピーしない
        settingsData: JSON.stringify(templateSettings)
      },
      create: {
        name: templateName,
        description: `${event.title} から作成されたテンプレート`,
        themeConfig: event.themeConfig,
        featureFlags: event.featureFlags,
        labelConfig: '{}', // 文言等はコピーしない
        settingsData: JSON.stringify(templateSettings)
      }
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

