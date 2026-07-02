export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { logout } from '../../../login/actions'
import { ToastSubmitButton } from '@/components/admin/ToastSubmitButton'
import { 
  updateEventDetails, saveEventSetting, updateEventSetting,
  addEventNews, deleteEventNews, addEventSchedule, deleteEventSchedule,
  addEventFaq, deleteEventFaq,
  toggleEventTrackPublication, deleteEventTrack, syncEventTracksFromSheet, syncOnlyEventAnalysisFromSheet,
  updateEventConfig,
  toggleEventDirectTrackPublication, deleteEventDirectTrack,
  createTemplateFromEvent
} from './actions'
import ColorInput from '@/components/ColorInput'
import RichTextEditor from '@/components/RichTextEditor'
import HostAdminForm from '@/components/admin/HostAdminForm'
import AdminHelpButton from '@/components/admin/AdminHelpButton'

// --- サーバーコンポーネント ---
export default async function EventSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // 認証・権限チェック
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const adminIdCookie = cookieStore.get('admin_id')
  
  if (session?.value !== 'true' || !adminIdCookie) {
    redirect('/admin/login')
  }

  const adminId = adminIdCookie.value
  if (adminId !== 'global') {
    const adminUser = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!adminUser || (adminUser.eventId && adminUser.eventId !== id)) {
      // 担当外のイベントにアクセスしようとした場合は弾く
      redirect('/admin')
    }
  }

  const event = await prisma.event.findUnique({ 
    where: { id },
    include: {
      news: { orderBy: { createdAt: 'desc' } },
      schedules: { orderBy: { order: 'asc' } },
      rules: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
      trackHonbans: { orderBy: { id: 'desc' } },
      tracks: { orderBy: { id: 'desc' } },
      settings: true
    }
  })

  if (!event) notFound()

  // Helper to get setting value
  const getSetting = (key: string, def = "") => event.settings.find(s => s.key === key)?.value || def

  const currentSheetUrl = getSetting('SHEET_URL')
  const activeTable = getSetting('ACTIVE_TRACK_TABLE', 'track')
  const ctaMode = getSetting('CTA_BUTTON_MODE', 'apply')
  const voteUrl = getSetting('VOTE_URL')
  const playlistUrl = getSetting('YOUTUBE_PLAYLIST_URL')
  const shareBasePostUrl = getSetting('SHARE_BASE_POST_URL')
  const celebrationThreshold = getSetting('CELEBRATION_THRESHOLD', '25')
  const maxIllustLimit = getSetting('MAX_ILLUST_RECOMMEND_LIMIT', '3')
  const isIllustEnabled = getSetting('ENABLE_ILLUST_RECOMMEND') === 'true'

  const themeConfig = JSON.parse(event.themeConfig || '{}')
  const featureFlags = JSON.parse(event.featureFlags || '{}')
  const labelConfig = JSON.parse(event.labelConfig || '{}')

  // Defaults based on Anonymous Fes
  const defaultTheme = {
    mainColor: themeConfig.mainColor || '#00f0ff',
    btnPrimaryColor: themeConfig.btnPrimaryColor || '#8b5cf6',
    btnSecondaryColor: themeConfig.btnSecondaryColor || '#ea580c',
    bgColor: themeConfig.bgColor || '#000000',
    textColor: themeConfig.textColor || '#ffffff',
    surfaceColor: themeConfig.surfaceColor || '#111827',
    enableNeon: themeConfig.enableNeon !== false, // default true
    bgUrl: themeConfig.bgUrl || '',
    bgPosition: themeConfig.bgPosition || '',
    logoUrl: themeConfig.logoUrl || '',
    logoWidth: themeConfig.logoWidth || '',
    logoMarginTop: themeConfig.logoMarginTop || '',
    baseFontSize: themeConfig.baseFontSize || 16,
    bgEffect: themeConfig.bgEffect || 'none',
    uiTexture: themeConfig.uiTexture || 'solid',
    cornerStyle: themeConfig.cornerStyle || 'rounded',
    btnPrimaryTextColor: themeConfig.btnPrimaryTextColor || '#ffffff',
    btnSecondaryTextColor: themeConfig.btnSecondaryTextColor || '#ffffff',
    btnRandomColor: themeConfig.btnRandomColor || '',
    btnRandomTextColor: themeConfig.btnRandomTextColor || '#000000',
    btnXColor: themeConfig.btnXColor || '',
    btnXTextColor: themeConfig.btnXTextColor || '#000000',
    btnScheduleColor: themeConfig.btnScheduleColor || '',
    btnScheduleTextColor: themeConfig.btnScheduleTextColor || '#ffffff',
    btnOpacity: themeConfig.btnOpacity || ''
  }
  const defaultLabels = {
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
    portalPeriod: labelConfig.portalPeriod || '',
    portalDescription: labelConfig.portalDescription || '',
    portalOfficialUrl: labelConfig.portalOfficialUrl || '',
    guidelinesTitle: labelConfig.guidelinesTitle || '募集要項',
    lyricsTab: labelConfig.lyricsTab || 'LYRICS',
    analysisTab: labelConfig.analysisTab || '歌詞考察',
    analysisNote: labelConfig.analysisNote || '※ChatGPT-4oによる自動考察です。AIの幻覚により、事実と異なる解釈が含まれる可能性があります。',
    disclaimer: labelConfig.disclaimer || '【免責事項】この考察はAIによる独自の解釈であり、作者様の意図と異なる場合があります。',
    entryPrefix: labelConfig.entryPrefix || 'ANF',
    randomPlayButtonLabel: labelConfig.randomPlayButtonLabel || 'ランダムで曲を聴く',
    scheduleButtonSubLabel: labelConfig.scheduleButtonSubLabel || 'イベント期間',
    scheduleButtonLabel: labelConfig.scheduleButtonLabel || 'YouTubeプレミア配信中！！',
    defaultMusicAnalysis: labelConfig.defaultMusicAnalysis || '',
    defaultIllustrationAnalysis: labelConfig.defaultIllustrationAnalysis || '',
    shareHashtag: labelConfig.shareHashtag || '#アノフェス'
  }
  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enableThumbSubmit: featureFlags.enableThumbSubmit ?? false,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false,
    enableArtistMain: featureFlags.enableArtistMain ?? false,
    enableAwards: featureFlags.enableAwards ?? false,
    enableHostSection: featureFlags.enableHostSection ?? true,
    enableScheduleButton: featureFlags.enableScheduleButton ?? true,
    enableCelebrationAlert: featureFlags.enableCelebrationAlert ?? true,
    applicationFormType: featureFlags.applicationFormType || 'standard'
  }

  const hosts = labelConfig.hosts || []

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ヘッダー部 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin" className="text-blue-600 hover:underline inline-block font-bold">
                ← ダッシュボードに戻る
              </Link>
              <Link href={`/admin/events/${event.id}/premiere`} className="text-purple-600 hover:underline inline-block font-bold ml-4">
                🎬 プレミア配信予定の管理
              </Link>
              <form action={logout}>
                <button type="submit" className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">ログアウト</button>
              </form>
            </div>
            <h1 className="text-3xl font-black">イベント管理: {event.title}</h1>
            <p className="text-foreground mt-1">/{event.slug}</p>
          </div>
          <Link href={`/${event.slug}`} target="_blank" className="px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:bg-fuchsia-700 transition">
            公開ページを確認 ↗
          </Link>
        </div>

        {/* テンプレート保存 */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
          <h2 className="text-sm font-bold text-foreground mb-3">設定をテンプレートとして保存</h2>
          <form action={async (formData) => {
            'use server'
            const name = formData.get('templateName') as string
            await createTemplateFromEvent(id, name)
          }} className="flex items-center gap-4">
            <input name="templateName" placeholder="保存するテンプレート名 (例: ポップデザイン版)" className="border p-2 rounded text-sm text-black flex-1 max-w-sm" required />
            <ToastSubmitButton label="現在の見栄えと機能ON/OFF設定を保存" className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-yellow-700 whitespace-nowrap" />
          </form>
          <p className="text-xs text-foreground mt-2">※保存されるのは「デザイン・見た目」設定と「機能ON/OFF（CTAモード等含む）」のみです。基本情報や各種固有のURL等は保存されません。</p>
        </div>

        {/* 目次 (Table of Contents) */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-gray-400">
          <h2 className="text-sm font-bold text-foreground mb-3">目次 (Table of Contents)</h2>
          <div className="flex flex-wrap gap-2">
            <a href="#basic-info" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-foreground transition-colors">基本情報</a>
            <a href="#appearance" className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 rounded-lg text-xs font-bold text-pink-700 transition-colors">デザイン・見た目</a>
            <a href="#labels" className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold text-amber-700 transition-colors">文言・ラベル</a>
            <a href="#host-settings" className="px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-bold text-green-700 transition-colors">主催者・メンバー</a>
            <a href="#features" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-700 transition-colors">機能設定</a>
            <a href="#news" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-foreground transition-colors">お知らせ</a>
            <a href="#schedule" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-foreground transition-colors">スケジュール</a>
            <a href="#rules" className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-bold text-purple-700 transition-colors">募集内容</a>
            <a href="#faq" className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 rounded-lg text-xs font-bold text-cyan-700 transition-colors">よくある質問</a>
            <a href="#tracks" className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 rounded-lg text-xs font-bold text-cyan-700 transition-colors">楽曲データ同期</a>
          </div>
        </div>

        {/* 1. 基本情報 */}
        <div id="basic-info" className="bg-white p-6 rounded-xl shadow border-l-4 border-surface-border scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">基本情報 (Basic Info)</h2>
            <AdminHelpButton contentKey="basic-info" />
          </div>
          <form action={updateEventDetails.bind(null, id)} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground">イベント名</label>
              <input name="title" defaultValue={event.title} className="w-full border p-2 rounded mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground">URL Slug</label>
              <input name="slug" defaultValue={event.slug} className="w-full border p-2 rounded mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">セクション見出し (例: 募集要項, イベントについて)</label>
              <input name="guidelinesTitle" defaultValue={defaultLabels.guidelinesTitle} className="w-full border p-2 rounded mb-4 bg-white" required />
              
              <label className="block text-sm font-bold text-foreground mb-2">セクション本文 (リッチテキスト)</label>
              <RichTextEditor name="description" defaultValue={event.description || ''} />
            </div>
            <ToastSubmitButton label="
              保存する
            " className="bg-gray-800 text-foreground px-4 py-2 rounded font-bold hover:bg-gray-700" />
          </form>
        </div>

        {/* 2. デザイン・アピアランス設定 */}
        <div id="appearance" className="bg-white p-6 rounded-xl shadow border-l-4 border-pink-500 space-y-6 scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-pink-800">デザイン・見た目 (Appearance)</h2>
            <AdminHelpButton contentKey="appearance" />
          </div>
          <form action={async (formData) => {
            'use server'
            const mainColor = formData.get('mainColor') as string
            const bgColor = formData.get('bgColor') as string
            const textColor = formData.get('textColor') as string
            const surfaceColor = formData.get('surfaceColor') as string
            const enableNeon = formData.get('enableNeon') === 'on'
            const bgEffect = formData.get('bgEffect') as string
            const uiTexture = formData.get('uiTexture') as string
            const cornerStyle = formData.get('cornerStyle') as string
            const bgUrl = formData.get('bgUrl') as string
            const bgPosition = formData.get('bgPosition') as string
            const logoUrl = formData.get('logoUrl') as string
            const logoWidth = formData.get('logoWidth') as string
            const logoMarginTop = formData.get('logoMarginTop') as string
            const btnOpacity = formData.get('btnOpacity') as string
            const btnPrimaryColor = formData.get('btnPrimaryColor') as string
            const btnPrimaryTextColor = formData.get('btnPrimaryTextColor') as string || '#ffffff'
            const btnSecondaryColor = formData.get('btnSecondaryColor') as string
            const btnSecondaryTextColor = formData.get('btnSecondaryTextColor') as string || '#ffffff'
            const btnRandomColor = formData.get('btnRandomColor') as string
            const btnRandomTextColor = formData.get('btnRandomTextColor') as string || '#000000'
            const btnXColor = formData.get('btnXColor') as string
            const btnXTextColor = formData.get('btnXTextColor') as string || '#000000'
            const btnScheduleColor = formData.get('btnScheduleColor') as string
            const btnScheduleTextColor = formData.get('btnScheduleTextColor') as string || '#ffffff'
            const baseFontSizeStr = formData.get('baseFontSize') as string
            const baseFontSize = baseFontSizeStr ? parseInt(baseFontSizeStr, 10) : 16
            await updateEventConfig(id, 'themeConfig', { mainColor, bgColor, textColor, surfaceColor, enableNeon, bgEffect, uiTexture, cornerStyle, bgUrl, bgPosition, logoUrl, logoWidth, logoMarginTop, btnOpacity, btnPrimaryColor, btnPrimaryTextColor, btnSecondaryColor, btnSecondaryTextColor, btnRandomColor, btnRandomTextColor, btnXColor, btnXTextColor, btnScheduleColor, btnScheduleTextColor, baseFontSize })
          }} className="flex flex-col gap-4">
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-bold text-sm text-foreground">トップページのボタン色設定</h3>
                <div className="w-1/3">
                  <label className="text-[10px] font-bold text-foreground block mb-1">ボタン全体の透明度 (0.0〜1.0)</label>
                  <input name="btnOpacity" defaultValue={defaultTheme.btnOpacity} placeholder="例: 0.8" className="w-full border p-1 rounded text-xs bg-white" />
                </div>
              </div>
              <p className="text-xs text-foreground mb-4">色を指定しない（空欄の）場合はデフォルトのグラデーションやテーマ色が適用されます。</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">応募ボタン背景</label>
                    <ColorInput name="btnPrimaryColor" defaultValue={defaultTheme.btnPrimaryColor} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">文字色</label>
                    <ColorInput name="btnPrimaryTextColor" defaultValue={defaultTheme.btnPrimaryTextColor} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">YouTubeボタン背景</label>
                    <ColorInput name="btnSecondaryColor" defaultValue={defaultTheme.btnSecondaryColor} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">文字色</label>
                    <ColorInput name="btnSecondaryTextColor" defaultValue={defaultTheme.btnSecondaryTextColor} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">ランダムボタン背景</label>
                    <ColorInput name="btnRandomColor" defaultValue={defaultTheme.btnRandomColor} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">文字色</label>
                    <ColorInput name="btnRandomTextColor" defaultValue={defaultTheme.btnRandomTextColor} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">X応援ボタン背景</label>
                    <ColorInput name="btnXColor" defaultValue={defaultTheme.btnXColor} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">文字色</label>
                    <ColorInput name="btnXTextColor" defaultValue={defaultTheme.btnXTextColor} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">スケジュールボタン背景</label>
                    <ColorInput name="btnScheduleColor" defaultValue={defaultTheme.btnScheduleColor} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-foreground block mb-1">文字色</label>
                    <ColorInput name="btnScheduleTextColor" defaultValue={defaultTheme.btnScheduleTextColor} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">メイン/アクセントカラー (HEX)</label>
                <ColorInput name="mainColor" defaultValue={defaultTheme.mainColor} />
                <p className="text-[10px] text-foreground mt-1">ボタンやアイコン、光の基本色です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">サイト背景色 (HEX)</label>
                <ColorInput name="bgColor" defaultValue={defaultTheme.bgColor} />
                <p className="text-[10px] text-foreground mt-1">全体の背景色。デフォルトは黒(#000000)です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">基本文字色 (HEX)</label>
                <ColorInput name="textColor" defaultValue={defaultTheme.textColor} />
                <p className="text-[10px] text-foreground mt-1">デフォルトは白(#ffffff)です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">基本フォントサイズ (px)</label>
                <input type="number" name="baseFontSize" defaultValue={defaultTheme.baseFontSize} className="w-full border p-2 rounded text-sm bg-white" min="12" max="24" />
                <p className="text-[10px] text-foreground mt-1">UI全体の基準サイズ。デフォルトは16です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">カード・パネル表面色 (HEX)</label>
                <ColorInput name="surfaceColor" defaultValue={defaultTheme.surfaceColor} />
                <p className="text-[10px] text-foreground mt-1">リストの背景など。デフォルトはダークグレー(#111827)です。</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" name="enableNeon" defaultChecked={defaultTheme.enableNeon} className="w-5 h-5 accent-pink-600 rounded cursor-pointer" />
                <span className="text-sm font-bold text-foreground">ネオン発光エフェクト (Cyberpunk Glow) を有効にする</span>
              </label>
              <p className="text-xs text-foreground pl-7 mb-4">OFFにすると、文字や枠線のドロップシャドウ（光る影）が消え、フラットでクリーンなデザインになります。サイバーパンク以外のテーマを作る際に有用です。</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">背景エフェクト</label>
                  <select name="bgEffect" defaultValue={defaultTheme.bgEffect || 'none'} className="w-full border p-2 rounded text-sm bg-white">
                    <option value="none">なし (None)</option>
                    <option value="scanline">ブラウン管・走査線 (CRT)</option>
                    <option value="grid">サイバー空間グリッド</option>
                    <option value="noise">フィルムグレイン (ノイズ)</option>
                  </select>
                  <p className="text-[10px] text-foreground mt-1">背景に重ねる特殊エフェクト</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">UIの質感 (カード等)</label>
                  <select name="uiTexture" defaultValue={defaultTheme.uiTexture || 'solid'} className="w-full border p-2 rounded text-sm bg-white">
                    <option value="solid">ソリッド (標準)</option>
                    <option value="glass">グラスモーフィズム (すりガラス)</option>
                  </select>
                  <p className="text-[10px] text-foreground mt-1">カードやヘッダーの背景の質感</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">角のスタイル</label>
                  <select name="cornerStyle" defaultValue={defaultTheme.cornerStyle || 'rounded'} className="w-full border p-2 rounded text-sm bg-white">
                    <option value="rounded">丸み (標準・角丸)</option>
                    <option value="sharp">シャープ (直角)</option>
                    <option value="pill">ピル型 (完全に丸い)</option>
                  </select>
                  <p className="text-[10px] text-foreground mt-1">UI全体の角の丸み</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs font-bold text-foreground block">メイン背景画像 (直リンクURL)</label>
                <a href="https://gyazo.com/ja" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors shadow-sm">
                  画像URLの取得には Gyazo が便利です ↗
                </a>
              </div>
              <input name="bgUrl" defaultValue={defaultTheme.bgUrl} placeholder="https://.../bg.jpg" className="w-full border p-2 rounded text-sm bg-white" />
              <p className="text-[10px] text-foreground mt-1 mb-2">※Gyazo等でアップロードし「画像アドレスをコピー(Direct Link)」を貼り付けてください。空欄の場合はデフォルト背景を使用。</p>
              <label className="text-xs font-bold text-foreground block mb-1">背景画像の表示位置 (background-position)</label>
              <input name="bgPosition" defaultValue={defaultTheme.bgPosition} placeholder="例: center center, center 20%, right top 等" className="w-full border p-2 rounded text-sm bg-white" />
              <p className="text-[10px] text-foreground mt-1">※キャラクターの顔が見えない場合などに位置を調整できます。空欄の場合は「center 75%」が適用されます。</p>
            </div>
            <div className="pt-2">
              <label className="text-xs font-bold text-foreground block mb-1">ロゴ画像 (直リンクURL)</label>
              <input name="logoUrl" defaultValue={defaultTheme.logoUrl} placeholder="https://.../logo.png" className="w-full border p-2 rounded text-sm bg-white" />
              <p className="text-[10px] text-foreground mt-1">※こちらも同様にGyazo等から取得した「画像アドレス(Direct Link)」を貼り付けてください。</p>
            </div>
            <div className="pt-2">
              <label className="text-xs font-bold text-foreground block mb-1">ロゴ画像の表示幅 (px)</label>
              <input name="logoWidth" type="number" defaultValue={defaultTheme.logoWidth} placeholder="例: 1000" className="w-full border p-2 rounded text-sm bg-white" />
              <p className="text-[10px] text-foreground mt-1">PC等でロゴが大きくなりすぎる場合、800や1000などの数値を指定してください。空欄の場合は巨大サイズになります。</p>
            </div>
            <div className="pt-2">
              <label className="text-xs font-bold text-foreground block mb-1">ロゴの上下位置調整 (px)</label>
              <input name="logoMarginTop" type="number" defaultValue={defaultTheme.logoMarginTop} placeholder="例: -50 (上へ), 50 (下へ)" className="w-full border p-2 rounded text-sm bg-white" />
              <p className="text-[10px] text-foreground mt-1">マイナス値で上に、プラス値で下に移動します。ボタンと重なってしまう場合に調整してください。空欄の場合はデフォルトの配置になります。</p>
            </div>
            <ToastSubmitButton label="デザインを保存" className="bg-pink-600 text-white p-2 rounded hover:bg-pink-700 text-sm font-bold w-32 mt-2" />
          </form>
        </div>

        {/* 3. 文言・カスタマイズ設定 */}
        <div id="labels" className="bg-white p-6 rounded-xl shadow border-l-4 border-amber-500 space-y-6 scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-amber-800">文言・ラベル設定 (Labels)</h2>
            <AdminHelpButton contentKey="labels" />
          </div>
          <form action={async (formData) => {
            'use server'
            
            const siteTitle = formData.get('siteTitle') as string
            const portalPeriod = formData.get('portalPeriod') as string
            const portalDescription = formData.get('portalDescription') as string
            const portalOfficialUrl = formData.get('portalOfficialUrl') as string
            const lyricsTab = formData.get('lyricsTab') as string
            const analysisTab = formData.get('analysisTab') as string
            const analysisNote = formData.get('analysisNote') as string
            const disclaimer = formData.get('disclaimer') as string
            const entryPrefix = formData.get('entryPrefix') as string
            const randomPlayButtonLabel = formData.get('randomPlayButtonLabel') as string
            const scheduleButtonSubLabel = formData.get('scheduleButtonSubLabel') as string
            const scheduleButtonLabel = formData.get('scheduleButtonLabel') as string
            const defaultMusicAnalysis = formData.get('defaultMusicAnalysis') as string
            const defaultIllustrationAnalysis = formData.get('defaultIllustrationAnalysis') as string
            const shareHashtag = formData.get('shareHashtag') as string
            await updateEventConfig(id, 'labelConfig', { siteTitle, portalPeriod, portalDescription, portalOfficialUrl, lyricsTab, analysisTab, analysisNote, disclaimer, entryPrefix, randomPlayButtonLabel, scheduleButtonSubLabel, scheduleButtonLabel, defaultMusicAnalysis, defaultIllustrationAnalysis, shareHashtag })
          }} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">サイト表示タイトル (ヘッダー等)</label>
                <input name="siteTitle" defaultValue={defaultLabels.siteTitle} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">ポータル用: 開催期間 (例: 2026.07.18 - 07.19)</label>
                <input name="portalPeriod" defaultValue={defaultLabels.portalPeriod} placeholder="期間を入力" className="w-full border p-2 rounded text-sm bg-white" />
              </div>
              <div className="flex-[2]">
                <label className="text-xs font-bold text-foreground block mb-1">ポータル用: 概要文</label>
                <input name="portalDescription" defaultValue={defaultLabels.portalDescription} placeholder="一覧カードに表示する短い概要" className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">ポータル用: 公式サイトURL (任意)</label>
                <input name="portalOfficialUrl" defaultValue={defaultLabels.portalOfficialUrl} placeholder="https://..." className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">エントリーNo接頭辞(3文字)</label>
                <input name="entryPrefix" defaultValue={defaultLabels.entryPrefix} maxLength={3} className="w-full border p-2 rounded text-sm bg-white uppercase" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">Xシェア用ハッシュタグ</label>
                <input name="shareHashtag" defaultValue={defaultLabels.shareHashtag} placeholder="#アノフェス" className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">タブ1 (デフォルト: LYRICS)</label>
                <input name="lyricsTab" defaultValue={defaultLabels.lyricsTab} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">タブ2 (デフォルト: 歌詞考察)</label>
                <input name="analysisTab" defaultValue={defaultLabels.analysisTab} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">考察タブの注意書き (小さく表示)</label>
              <input name="analysisNote" defaultValue={defaultLabels.analysisNote} className="w-full border p-2 rounded text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">楽曲詳細ページの免責事項 (フッター等)</label>
              <textarea name="disclaimer" defaultValue={defaultLabels.disclaimer} className="w-full border p-2 rounded text-sm bg-white h-20"></textarea>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">ランダム再生ボタン名</label>
                <input name="randomPlayButtonLabel" defaultValue={defaultLabels.randomPlayButtonLabel} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">配信ボタン上の小文字 (例: イベント期間)</label>
                <input name="scheduleButtonSubLabel" defaultValue={defaultLabels.scheduleButtonSubLabel} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">配信ボタン名</label>
                <input name="scheduleButtonLabel" defaultValue={defaultLabels.scheduleButtonLabel} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4">
              <h3 className="font-bold text-sm text-amber-800 mb-2">応募フォームの初期入力テンプレート</h3>
              <p className="text-xs text-amber-700 mb-4">応募画面の「活動概要・歌詞考察」欄に最初から入力されているテキストを設定できます。</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">テンプレート (音楽応募用)</label>
                  <textarea name="defaultMusicAnalysis" defaultValue={defaultLabels.defaultMusicAnalysis} className="w-full border p-2 rounded text-sm bg-white h-32" placeholder="ボーカル：&#10;作曲：&#10;動画："></textarea>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">テンプレート (イラスト応募用)</label>
                  <textarea name="defaultIllustrationAnalysis" defaultValue={defaultLabels.defaultIllustrationAnalysis} className="w-full border p-2 rounded text-sm bg-white h-32" placeholder="使用AIツール：&#10;プロンプト等の工夫点："></textarea>
                </div>
              </div>
            </div>
            <ToastSubmitButton label="文言・ラベルを保存" className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700 text-sm font-bold mt-2" />
          </form>
        </div>

        {/* 3.5 主催者・運営メンバー設定 */}
        <div id="host-settings" className="scroll-mt-6">
          <HostAdminForm 
            eventId={id} 
            initialHosts={hosts} 
            initialEnableHostSection={defaultFeatures.enableHostSection} 
          />
        </div>

        {/* 4. 各種URL設定 */}
        <div id="features" className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 space-y-6 scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800">機能設定 (Settings)</h2>
            <AdminHelpButton contentKey="features" />
          </div>
          
          <form action={updateEventSetting.bind(null, id, 'SHEET_URL')} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-foreground">スプレッドシート（CSVエクスポートURL）</label>
            <input name="value" defaultValue={currentSheetUrl} placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=..." className="border p-2 rounded text-sm bg-white" />
            <p className="text-xs text-slate-500 mt-1 mb-2 leading-relaxed">
              ※ CSVの1行目（ヘッダー）に以下の項目名を含めてください。<br/>
              <b>必須項目:</b> <code className="bg-slate-100 px-1 rounded">タイムスタンプ</code>, <code className="bg-slate-100 px-1 rounded">No</code>, <code className="bg-slate-100 px-1 rounded">title</code> または <code className="bg-slate-100 px-1 rounded">■ 曲タイトル</code>, <code className="bg-slate-100 px-1 rounded">URL</code> または <code className="bg-slate-100 px-1 rounded">youtube:URL</code>, <code className="bg-slate-100 px-1 rounded">artist</code> または <code className="bg-slate-100 px-1 rounded">名前（ハンドルネーム）</code><br/>
              <b>任意項目:</b> <code className="bg-slate-100 px-1 rounded">lyrics</code>, <code className="bg-slate-100 px-1 rounded">xAccount</code>, <code className="bg-slate-100 px-1 rounded">メールアドレス</code>, <code className="bg-slate-100 px-1 rounded">歌詞考察</code>
            </p>
            <ToastSubmitButton label="URLを保存" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm font-bold" />
          </form>

          <form action={updateEventSetting.bind(null, id, 'VOTE_URL')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-foreground">投票フォームのURL</label>
            <input name="value" defaultValue={voteUrl} placeholder="https://docs.google.com/forms/d/..." className="border p-2 rounded text-sm bg-white" />
            <ToastSubmitButton label="投票URLを保存" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 text-sm font-bold" />
          </form>

          <form action={updateEventSetting.bind(null, id, 'YOUTUBE_PLAYLIST_URL')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-foreground">YouTube再生リストURL</label>
            <input name="value" defaultValue={playlistUrl} placeholder="https://www.youtube.com/playlist?list=..." className="border p-2 rounded text-sm bg-white" />
            <ToastSubmitButton label="再生リストURLを保存" className="bg-red-600 text-white p-2 rounded hover:bg-red-700 text-sm font-bold" />
          </form>

          <form action={updateEventSetting.bind(null, id, 'SHARE_BASE_POST_URL')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-foreground">𝕏共有時引用ポストURL</label>
            <input name="value" defaultValue={shareBasePostUrl} placeholder="https://x.com/username/status/..." className="border p-2 rounded text-sm bg-white" />
            <ToastSubmitButton label="共有用URLを保存" className="bg-sky-500 text-foreground p-2 rounded hover:bg-sky-600 text-sm font-bold" />
          </form>

          <form action={updateEventSetting.bind(null, id, 'CTA_BUTTON_MODE')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-foreground">CTAボタンのモード</label>
            <select name="value" defaultValue={ctaMode} className="border p-2 rounded text-sm bg-white">
              <option value="hidden">非表示</option>
              <option value="apply">エントリーする（現在は非推奨）</option>
              <option value="vote">投票する</option>
              <option value="voting">投票中（集計用等）</option>
              <option value="result">結果発表へ</option>
            </select>
            <ToastSubmitButton label="CTAモードを保存" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 text-sm font-bold" />
          </form>

          <form action={async (formData) => {
            'use server'
            
            const enableRandomPlay = formData.get('enableRandomPlay') === 'true'
            const enableThumbSubmit = formData.get('enableThumbSubmit') === 'true'
            const enablePlaylistInfo = formData.get('enablePlaylistInfo') === 'true'
            const enableShowCreators = formData.get('enableShowCreators') === 'true'
            const enableArtistMain = formData.get('enableArtistMain') === 'true'
            const enableAwards = formData.get('enableAwards') === 'true'
            const enableHostSection = formData.get('enableHostSection') === 'true'
            const enableScheduleButton = formData.get('enableScheduleButton') === 'true'
            const enableCelebrationAlert = formData.get('enableCelebrationAlert') === 'true'
            const applicationFormType = formData.get('applicationFormType') as string || 'standard'
            await updateEventConfig(id, 'featureFlags', { enableRandomPlay, enableThumbSubmit, enablePlaylistInfo, enableShowCreators, enableArtistMain, enableAwards, enableHostSection, enableScheduleButton, enableCelebrationAlert, applicationFormType })
          }} className="flex flex-col gap-2 pt-4 border-t">
            <h3 className="font-bold text-sm text-foreground mb-2">機能ON/OFF (Features)</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">ランダム再生ボタン</label>
                <select name="enableRandomPlay" defaultValue={defaultFeatures.enableRandomPlay ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">サムネイル投稿機能</label>
                <select name="enableThumbSubmit" defaultValue={defaultFeatures.enableThumbSubmit ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">有効 (ON)</option>
                  <option value="false">無効 (OFF)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">制作者名 表示設定</label>
                <select name="enableShowCreators" defaultValue={defaultFeatures.enableShowCreators ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">アーティストメイン表示</label>
                <select name="enableArtistMain" defaultValue={defaultFeatures.enableArtistMain ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">有効 (ON)</option>
                  <option value="false">無効 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">AWARDSボタン</label>
                <select name="enableAwards" defaultValue={defaultFeatures.enableAwards ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">スケジュールボタン表示</label>
                <select name="enableScheduleButton" defaultValue={defaultFeatures.enableScheduleButton ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">新曲発掘アラート演出</label>
                <select name="enableCelebrationAlert" defaultValue={defaultFeatures.enableCelebrationAlert ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">有効 (ON)</option>
                  <option value="false">無効 (OFF)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">応募フォームの形式</label>
                <select name="applicationFormType" defaultValue={defaultFeatures.applicationFormType} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="standard">標準（タイトル、URL、歌詞、考察、等）</option>
                  <option value="anonymous">匿名フェス用（SunoURL、パスワード、直アップロード等）</option>
                  <option value="illustration">イラスト投稿用（音楽なし、XURL入力メイン）</option>
                </select>
              </div>
            </div>

            <ToastSubmitButton label="ON/OFFを保存" className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 text-sm font-bold mt-2 w-32" />
          </form>

          <form action={updateEventSetting.bind(null, id, 'ENABLE_ILLUST_RECOMMEND')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-foreground">推しイラスト機能を有効にする</label>
            <select name="value" defaultValue={isIllustEnabled ? 'true' : 'false'} className="border p-2 rounded text-sm bg-white">
              <option value="true">有効</option>
              <option value="false">無効</option>
            </select>
            <ToastSubmitButton label="推しイラスト設定を保存" className="bg-fuchsia-600 text-white p-2 rounded hover:bg-fuchsia-700 text-sm font-bold" />
          </form>
        </div>

        {/* 3. News */}
        <div id="news" className="bg-white p-6 rounded-xl shadow scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">お知らせ (News)</h2>
            <AdminHelpButton contentKey="news" />
          </div>
          <form action={addEventNews.bind(null, id)} className="flex flex-col gap-2 mb-4">
            <input name="title" placeholder="タイトル" className="border p-2 rounded bg-white" required />
            <textarea name="content" placeholder="内容" className="border p-2 rounded bg-white"></textarea>
            <ToastSubmitButton label="追加する" className="bg-blue-600 text-white p-2 rounded font-bold" />
          </form>
          <ul className="space-y-2">
            {event.news.map(n => (
              <li key={n.id} className="flex justify-between items-center border-b pb-2">
                <div><span className="font-bold">{n.title}</span> - {n.content}</div>
                <form action={deleteEventNews.bind(null, id, n.id)}><button className="text-red-500 text-sm font-bold">削除</button></form>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Schedule */}
        <div id="schedule" className="bg-white p-6 rounded-xl shadow scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">スケジュール (Schedule)</h2>
            <AdminHelpButton contentKey="schedule" />
          </div>
          <form action={addEventSchedule.bind(null, id)} className="flex flex-col gap-2 mb-4">
            <input name="title" placeholder="イベント名" className="border p-2 rounded bg-white" required />
            <input name="date" placeholder="日時" className="border p-2 rounded bg-white" required />
            <input name="order" type="number" placeholder="並び順" className="border p-2 rounded bg-white" defaultValue={0} />
            <ToastSubmitButton label="追加する" className="bg-green-600 text-white p-2 rounded font-bold" />
          </form>
          <ul className="space-y-2">
            {event.schedules.map(s => (
              <li key={s.id} className="flex justify-between items-center border-b pb-2">
                <div><span className="text-foreground">[{s.order}]</span> <b>{s.title}</b> : {s.date}</div>
                <form action={deleteEventSchedule.bind(null, id, s.id)}><button className="text-red-500 text-sm font-bold">削除</button></form>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. FAQ */}
        <div id="faq" className="bg-white p-6 rounded-xl shadow scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">よくある質問 (FAQ)</h2>
            <AdminHelpButton contentKey="faq" />
          </div>
          <form action={addEventFaq.bind(null, id)} className="flex flex-col gap-2 mb-4">
            <input name="question" placeholder="質問" className="border p-2 rounded bg-white" required />
            <textarea name="answer" placeholder="回答" className="border p-2 rounded bg-white" required></textarea>
            <input name="order" type="number" placeholder="並び順" className="border p-2 rounded bg-white" defaultValue={0} />
            <ToastSubmitButton label="追加する" className="bg-[var(--color-cyan-500)] text-white p-2 rounded font-bold" />
          </form>
          <ul className="space-y-4">
            {event.faqs.map(f => (
              <li key={f.id} className="border-b pb-4 flex justify-between">
                <div>
                  <div className="text-sm font-bold text-[var(--color-cyan-400)]">Q. {f.question}</div>
                  <div className="text-sm mt-1 whitespace-pre-wrap">A. {f.answer}</div>
                </div>
                <form action={deleteEventFaq.bind(null, id, f.id)}><button className="text-red-500 text-sm font-bold">削除</button></form>
              </li>
            ))}
          </ul>
        </div>

        {/* 7. Tracks Sync */}
        <div id="tracks" className="bg-white p-6 rounded-xl shadow border-t-4 border-[var(--color-cyan-400)] scroll-mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--color-cyan-400)]">参加楽曲データ同期 (Tracks)</h2>
            <AdminHelpButton contentKey="tracks" />
          </div>
          
          <form action={async (formData) => {
            'use server'
            await syncEventTracksFromSheet(id, formData)
          }} className="space-y-4 mb-6">
            <div className="flex items-center gap-4 bg-cyan-50 p-4 rounded-xl border border-[var(--color-cyan-400)]">
              <label className="text-sm font-bold text-[var(--color-cyan-400)]">更新スタートNo:</label>
              <input type="number" name="startId" defaultValue={event.trackHonbans.length > 0 ? (Math.max(...event.trackHonbans.map((t: any) => parseInt(t.entryNo || "0"))) + 1) : 1} className="w-24 border p-2 rounded font-bold bg-white" />
            </div>
            <ToastSubmitButton label="
              スプレッドシートから最新データを取得・同期する
            " className="bg-[var(--color-cyan-500)] text-white p-3 rounded-lg font-bold w-full hover:bg-[var(--color-cyan-500)] transition" />
          </form>



          <div className="mt-8 text-sm font-bold border-b pb-2">
            登録されている楽曲数: <span className="text-[var(--color-cyan-400)] text-lg">{event.tracks?.length || 0}</span> 曲 (Direct Apply: Track) / <span className="text-[var(--color-cyan-400)] text-lg">{event.trackHonbans?.length || 0}</span> 曲 (Sync: TrackHonban)
          </div>
          <div className="mt-8 text-sm font-bold border-b pb-2 text-[var(--color-cyan-500)]">
            【直接応募版 (Track)】の楽曲一覧
          </div>
          <ul className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2 mb-8">
            {event.tracks && event.tracks.length > 0 ? event.tracks.map(t => (
              <li key={t.id} className="flex justify-between items-center border-b pb-4 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-200 px-1 rounded">No.{t.entryNo || t.id.toString().padStart(3, '0')}</span>
                    <span className="font-bold">{t.title}</span>
                    {t.published ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full font-bold">公開中</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-foreground px-2 rounded-full font-bold">非公開</span>
                    )}
                  </div>
                  <div className="text-xs text-foreground mt-1">{t.artistName || "匿名"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/${event.slug}/tracks/${t.id}?preview=all`} target="_blank" className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">確認</a>
                  <form action={toggleEventDirectTrackPublication.bind(null, id, t.id, !t.published)}>
                    <button className={`px-3 py-1 text-xs font-bold rounded ${t.published ? 'bg-amber-100 text-amber-700' : 'bg-green-600 text-white'}`}>
                      {t.published ? '非公開へ' : '公開する'}
                    </button>
                  </form>
                  <form action={deleteEventDirectTrack.bind(null, id, t.id)}>
                    <button className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200">削除</button>
                  </form>
                </div>
              </li>
            )) : <p className="text-sm text-foreground">まだ楽曲が登録されていません。</p>}
          </ul>

          <div className="mt-8 text-sm font-bold border-b pb-2 text-[var(--color-cyan-500)]">
            【スプレッドシート同期版 (TrackHonban)】の楽曲一覧
          </div>
          <ul className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
            {event.trackHonbans && event.trackHonbans.length > 0 ? event.trackHonbans.map(t => (
              <li key={t.id} className="flex justify-between items-center border-b pb-4 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-200 px-1 rounded">No.{t.entryNo}</span>
                    <span className="font-bold">{t.title}</span>
                    {t.published ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full font-bold">公開中</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-foreground px-2 rounded-full font-bold">非公開</span>
                    )}
                  </div>
                  <div className="text-xs text-foreground mt-1">{t.artistName || "匿名"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/${event.slug}/tracks/${t.id}?preview=honban`} target="_blank" className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">確認</a>
                  <form action={toggleEventTrackPublication.bind(null, id, t.id, !t.published)}>
                    <button className={`px-3 py-1 text-xs font-bold rounded ${t.published ? 'bg-amber-100 text-amber-700' : 'bg-green-600 text-white'}`}>
                      {t.published ? '非公開へ' : '公開する'}
                    </button>
                  </form>
                  <form action={deleteEventTrack.bind(null, id, t.id)}>
                    <button className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200">削除</button>
                  </form>
                </div>
              </li>
            )) : <p className="text-sm text-foreground">同期された楽曲がありません。</p>}
          </ul>
        </div>

      </div>
    </div>
  )
}
