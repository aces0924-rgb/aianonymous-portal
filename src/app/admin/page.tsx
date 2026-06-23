export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { addAdminUser, deleteAdminUser, addEvent, getEventTemplates, updateGlobalSettings } from './actions'
import { logout } from './login/actions'

export const metadata = {
  title: '管理者ダッシュボード | AI-anonymous MUSIC FES.',
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const adminIdCookie = cookieStore.get('admin_id')

  if (session?.value !== 'true' || !adminIdCookie) {
    redirect('/admin/login')
  }

  const adminId = adminIdCookie.value
  let isGlobalAdmin = false

  if (adminId === 'global') {
    isGlobalAdmin = true
  } else {
    const adminUser = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!adminUser) redirect('/admin/login')
    
    if (adminUser.eventId) {
      // イベント専用管理者は、自分のイベント管理画面に直行する
      redirect(`/admin/events/${adminUser.eventId}/settings`)
    } else {
      isGlobalAdmin = true
    }
  }

  // グローバル管理者のみここから下を表示
  const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } })
  const adminUsers = await prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' } })
  const templates = await getEventTemplates()
  const globalSettings = await prisma.globalSetting.findMany()
  const settingsMap = globalSettings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  const bgUrl = settingsMap['portal_bg_url'] || "https://i.gyazo.com/3d88429640b885cb595bc0c3756007d6.jpg"
  const logoUrl = settingsMap['portal_logo_url'] || "https://i.gyazo.com/2d95ce2d1f241232b192d53bc4dd4fd4.png"
  const logoWidth = settingsMap['portal_logo_width'] || "320"

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h1 className="text-3xl font-black italic">マスターダッシュボード</h1>
          <form action={logout} className="shrink-0 flex items-center">
            <button className="px-6 py-4 border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-colors font-bold text-sm bg-white">
              ログアウト
            </button>
          </form>
        </div>

        {/* Portal Settings */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-cyan-500">
          <h2 className="text-xl font-bold mb-4">ポータル全体設定</h2>
          <form action={updateGlobalSettings} className="flex flex-col gap-4">
            <div>
              <label className="block font-bold text-sm mb-1">背景画像 URL</label>
              <input name="bgUrl" defaultValue={bgUrl} className="border p-2 rounded text-black w-full" />
            </div>
            <div>
              <label className="block font-bold text-sm mb-1">ロゴ画像 URL</label>
              <input name="logoUrl" defaultValue={logoUrl} className="border p-2 rounded text-black w-full" />
            </div>
            <div>
              <label className="block font-bold text-sm mb-1">ロゴ画像の幅 (px)</label>
              <input name="logoWidth" type="number" defaultValue={logoWidth} className="border p-2 rounded text-black w-full max-w-xs" />
              <p className="text-xs text-gray-500 mt-1">※空欄にした場合は画面幅いっぱいに自動調整されます。</p>
            </div>
            <button type="submit" className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 font-bold self-start mt-2">
              保存して反映
            </button>
          </form>
        </div>

        {/* Events Management */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-fuchsia-500">
          <h2 className="text-xl font-bold mb-4">イベント管理 (Events)</h2>
          
          <form action={addEvent} className="flex flex-col gap-2 mb-6 p-4 bg-gray-50 border rounded-xl">
            <h3 className="font-bold text-sm text-foreground">＋ 新規イベントを作成</h3>
            <div className="flex gap-2">
              <input name="title" placeholder="イベント名 (例: 第2回アノフェス)" className="border p-2 rounded text-black flex-1" required />
              <input name="slug" placeholder="URL部分 (例: vol2)" className="border p-2 rounded text-black flex-1" required />
              <button type="submit" className="bg-fuchsia-600 text-white px-4 py-2 rounded hover:bg-fuchsia-700 font-bold whitespace-nowrap">作成</button>
            </div>
            <div className="mt-2">
              <select name="templateId" className="border p-2 rounded text-black w-full bg-white">
                <option value="">テンプレートなし (デフォルト)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.description ? `(${t.description})` : ''}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-foreground">※ URL部分は `aianonymous-portal.com/【ここ】` になります（半角英数字推奨、1, 2, 3 のような数字だけでもOKです）</p>
          </form>

          <ul className="space-y-4">
            {events.map(e => (
              <li key={e.id} className="border p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-bold text-lg">{e.title}</h3>
                  <p className="text-foreground text-sm">/{e.slug}</p>
                </div>
                <Link href={`/admin/events/${e.id}/settings`} className="bg-fuchsia-100 text-fuchsia-700 px-4 py-2 rounded-lg font-bold hover:bg-fuchsia-200 transition-colors">
                  管理画面を開く →
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin Accounts Management */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500">
          <h2 className="text-xl font-bold mb-4">管理者アカウント (Admins)</h2>
          <form action={addAdminUser} className="flex flex-col gap-2 mb-4">
            <input name="email" type="email" placeholder="メールアドレス (ログインID)" className="border p-2 rounded text-black" required />
            <input name="password" type="password" placeholder="パスワード" className="border p-2 rounded text-black" required />
            <select name="eventId" className="border p-2 rounded text-black bg-white">
              <option value="">全てのイベントの権限を持つ (Global)</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 font-bold">追加する</button>
          </form>
          <ul className="space-y-2">
            {adminUsers.map(u => (
              <li key={u.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-bold text-lg">{u.email}</span>
                  {u.eventId ? (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full border border-indigo-200 font-bold">
                      管理イベント: {events.find(e => e.id === u.eventId)?.title || u.eventId}
                    </span>
                  ) : (
                    <span className="ml-2 text-xs bg-gray-100 text-foreground px-2 py-1 rounded-full border border-gray-200 font-bold">
                      全イベント (Global)
                    </span>
                  )}
                </div>
                <form action={deleteAdminUser.bind(null, u.id)}>
                  <button className="text-red-500 text-sm hover:underline font-bold">削除</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
