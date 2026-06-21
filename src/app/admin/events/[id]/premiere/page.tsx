import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { addPremiereSchedule, updatePremiereSchedule, deletePremiereSchedule, updateTimetableUrl } from './actions';
import { ToastSubmitButton } from '@/components/admin/ToastSubmitButton';

export const dynamic = 'force-dynamic';

export default async function PremiereAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 認証チェック
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  const adminIdCookie = cookieStore.get('admin_id');
  
  if (session?.value !== 'true' || !adminIdCookie) {
    redirect('/admin/login');
  }

  const adminId = adminIdCookie.value;
  if (adminId !== 'global') {
    const adminUser = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!adminUser || (adminUser.eventId && adminUser.eventId !== id)) {
      redirect('/admin');
    }
  }

  const event = await prisma.event.findUnique({ 
    where: { id },
    include: {
      premiereSchedules: { orderBy: { day: 'asc' } },
      settings: true
    }
  });

  if (!event) notFound();

  const timetableUrlSetting = event.settings?.find(s => s.key === 'timetableUrl');
  const timetableUrl = timetableUrlSetting?.value || '';

  const schedules = event.premiereSchedules || [];

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/admin/events/${id}/settings`} className="text-blue-600 hover:underline inline-block font-bold">
            ← イベント設定に戻る
          </Link>
        </div>
        <h1 className="text-3xl font-black">🎬 プレミア配信予定の管理 : {event.title}</h1>
        
        {/* 全体設定（タイムテーブル画像など） */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4">イベント全体設定</h2>
          <form action={updateTimetableUrl.bind(null, id)} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">タイムテーブル画像のURL (Twitter画像やGyazoなど)</label>
              <input 
                name="timetableUrl" 
                type="url" 
                defaultValue={timetableUrl} 
                placeholder="https://pbs.twimg.com/..." 
                className="w-full border p-2 rounded" 
              />
            </div>
            <div>
              <ToastSubmitButton 
                label="保存" 
                loadingLabel="保存中..." 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
                successMessage="設定を保存しました" 
              />
            </div>
          </form>
          {timetableUrl && (
            <div className="mt-4">
              <a href={timetableUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                現在の画像を確認する ↗
              </a>
            </div>
          )}
        </div>

        {/* 新規追加フォーム */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <h2 className="text-xl font-bold mb-4">新規追加</h2>
          <form action={addPremiereSchedule.bind(null, id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">日数 (Day)</label>
              <input name="day" type="number" required placeholder="例: 1" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">配信日時</label>
              <input name="date" type="datetime-local" required className="w-full border p-2 rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">YouTube待機所URL</label>
              <input name="youtubeUrl" type="url" placeholder="https://youtube.com/..." className="w-full border p-2 rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">紹介する楽曲リスト (カンマ区切り)</label>
              <input name="trackRange" type="text" required placeholder="例: 001,003,015" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">紹介曲数</label>
              <input name="trackCount" type="number" required placeholder="例: 15" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">サムネイル用GoogleドライブID</label>
              <input name="thumbnailDriveId" type="text" placeholder="IDを入力" className="w-full border p-2 rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">備考</label>
              <input name="remarks" type="text" placeholder="特記事項など" className="w-full border p-2 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <input name="isPublic" type="checkbox" value="true" defaultChecked className="w-5 h-5" id="isPublicAdd" />
              <label htmlFor="isPublicAdd" className="font-bold cursor-pointer">公開する</label>
            </div>
            <div className="md:col-span-2 flex justify-end items-center gap-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-green-700">
                  <input type="checkbox" name="acceptsThumbnail" value="true" className="w-5 h-5 text-green-600" />
                  サムネイル募集を受け付ける
                </label>
              </div>
              <div>
                <ToastSubmitButton 
                  label="追加" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow"
                  successMessage="予定を追加しました" 
                />
              </div>
            </div>
          </form>
        </div>

        {/* 一覧 */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">登録済みの予定 ({schedules.length}件)</h2>
          <div className="space-y-6">
            {schedules.map(schedule => {
              // Convert to local datetime string for input
              const dateObj = new Date(schedule.date);
              const tzOffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
              const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);

              return (
              <div key={schedule.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4">
                <form action={updatePremiereSchedule.bind(null, id, schedule.id)} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">日数 (Day)</label>
                    <input name="day" type="number" required defaultValue={schedule.day} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">配信日時</label>
                    <input name="date" type="datetime-local" required defaultValue={localISOTime} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1">YouTube待機所URL</label>
                    <input name="youtubeUrl" type="url" defaultValue={schedule.youtubeUrl || ''} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1">紹介する楽曲リスト (カンマ区切り)</label>
                    <input name="trackRange" type="text" required defaultValue={schedule.trackRange} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">紹介曲数</label>
                    <input name="trackCount" type="number" required defaultValue={schedule.trackCount} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">サムネイル用GoogleドライブID</label>
                    <input name="thumbnailDriveId" type="text" defaultValue={schedule.thumbnailDriveId || ''} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1">備考</label>
                    <input name="remarks" type="text" defaultValue={schedule.remarks || ''} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input name="isPublic" type="checkbox" value="true" defaultChecked={schedule.isPublic} className="w-4 h-4" id={`isPublic-${schedule.id}`} />
                    <label htmlFor={`isPublic-${schedule.id}`} className="text-sm font-bold cursor-pointer">公開する</label>
                  </div>
                  <div className="md:col-span-2 flex justify-between items-center">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-green-700">
                        <input type="checkbox" name="acceptsThumbnail" value="true" defaultChecked={schedule.acceptsThumbnail} className="w-5 h-5 text-green-600" />
                        サムネイル募集を受け付ける
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <ToastSubmitButton 
                        label="更新" 
                        loadingLabel="更新中..." 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                        successMessage="更新しました" 
                      />
                    </div>
                  </div>
                </form>
                
                <form action={deletePremiereSchedule.bind(null, id, schedule.id)} className="flex items-end justify-end md:justify-start">
                   <button 
                     type="submit" 
                     className="bg-red-100 text-red-600 hover:bg-red-200 py-1 px-4 rounded font-bold text-sm"
                   >
                     削除
                   </button>
                </form>
              </div>
            )})}
            {schedules.length === 0 && (
              <p className="text-gray-500 text-center py-8">登録されている予定はありません。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
