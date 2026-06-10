export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { 
  updateEventDetails, saveEventSetting, updateEventSetting,
  addEventNews, deleteEventNews, addEventSchedule, deleteEventSchedule,
  addEventFaq, deleteEventFaq,
  toggleEventTrackPublication, deleteEventTrack, syncEventTracksFromSheet, syncOnlyEventAnalysisFromSheet,
  updateEventConfig
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
    logoUrl: themeConfig.logoUrl || '',
    baseFontSize: themeConfig.baseFontSize || 16,
    bgEffect: themeConfig.bgEffect || 'none',
    uiTexture: themeConfig.uiTexture || 'solid',
    cornerStyle: themeConfig.cornerStyle || 'rounded'
  }
  const defaultLabels = {
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
    guidelinesTitle: labelConfig.guidelinesTitle || '募集要項',
    lyricsTab: labelConfig.lyricsTab || 'LYRICS',
    analysisTab: labelConfig.analysisTab || '歌詞考察',
    analysisNote: labelConfig.analysisNote || '※ChatGPT-4oによる自動考察です。AIの幻覚により、事実と異なる解釈が含まれる可能性があります。',
    disclaimer: labelConfig.disclaimer || '【免責事項】この考察はAIによる独自の解釈であり、作者様の意図と異なる場合があります。',
    entryPrefix: labelConfig.entryPrefix || 'ANF'
  }
  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enableThumbSubmit: featureFlags.enableThumbSubmit ?? false,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false,
    enableArtistMain: featureFlags.enableArtistMain ?? false,
    enableAwards: featureFlags.enableAwards ?? false,
    enableHostSection: featureFlags.enableHostSection ?? true
  }

  const hosts = labelConfig.hosts || []

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ヘッダー部 */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-blue-600 hover:underline mb-2 inline-block font-bold">
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-3xl font-black">イベント管理: {event.title}</h1>
            <p className="text-gray-500 mt-1">/{event.slug}</p>
          </div>
          <Link href={`/${event.slug}`} target="_blank" className="px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:bg-fuchsia-700 transition">
            公開ページを確認 ↗
          </Link>
        </div>

        {/* 目次 (Table of Contents) */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-gray-400">
          <h2 className="text-sm font-bold text-gray-500 mb-3">目次 (Table of Contents)</h2>
          <div className="flex flex-wrap gap-2">
            <a href="#basic-info" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">基本情報</a>
            <a href="#appearance" className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 rounded-lg text-xs font-bold text-pink-700 transition-colors">デザイン・見た目</a>
            <a href="#labels" className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold text-amber-700 transition-colors">文言・ラベル</a>
            <a href="#host-settings" className="px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-bold text-green-700 transition-colors">主催者・メンバー</a>
            <a href="#features" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-700 transition-colors">機能設定</a>
            <a href="#news" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">お知らせ</a>
            <a href="#schedule" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">スケジュール</a>
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
              <label className="block text-sm font-bold text-gray-700">イベント名</label>
              <input name="title" defaultValue={event.title} className="w-full border p-2 rounded mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">URL Slug</label>
              <input name="slug" defaultValue={event.slug} className="w-full border p-2 rounded mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">セクション見出し (例: 募集要項, イベントについて)</label>
              <input name="guidelinesTitle" defaultValue={defaultLabels.guidelinesTitle} className="w-full border p-2 rounded mb-4 bg-white" required />
              
              <label className="block text-sm font-bold text-gray-700 mb-2">セクション本文 (リッチテキスト)</label>
              <RichTextEditor name="description" defaultValue={event.description || ''} />
            </div>
            <button type="submit" className="bg-gray-800 text-foreground px-4 py-2 rounded font-bold hover:bg-gray-700">
              保存する
            </button>
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
            const logoUrl = formData.get('logoUrl') as string
            const btnPrimaryColor = formData.get('btnPrimaryColor') as string
            const btnSecondaryColor = formData.get('btnSecondaryColor') as string
            const baseFontSizeStr = formData.get('baseFontSize') as string
            const baseFontSize = baseFontSizeStr ? parseInt(baseFontSizeStr, 10) : 16
            await updateEventConfig(id, 'themeConfig', { mainColor, bgColor, textColor, surfaceColor, enableNeon, bgEffect, uiTexture, cornerStyle, bgUrl, logoUrl, btnPrimaryColor, btnSecondaryColor, baseFontSize })
          }} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">メインボタン色 (HEX)</label>
                <ColorInput name="btnPrimaryColor" defaultValue={defaultTheme.btnPrimaryColor} />
                <p className="text-[10px] text-gray-400 mt-1">応募・投票ボタンの色</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">サブボタン色 (HEX)</label>
                <ColorInput name="btnSecondaryColor" defaultValue={defaultTheme.btnSecondaryColor} />
                <p className="text-[10px] text-gray-400 mt-1">YouTube等のボタンの色</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">メイン/アクセントカラー (HEX)</label>
                <ColorInput name="mainColor" defaultValue={defaultTheme.mainColor} />
                <p className="text-[10px] text-gray-400 mt-1">ボタンやアイコン、光の基本色です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">サイト背景色 (HEX)</label>
                <ColorInput name="bgColor" defaultValue={defaultTheme.bgColor} />
                <p className="text-[10px] text-gray-400 mt-1">全体の背景色。デフォルトは黒(#000000)です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">基本文字色 (HEX)</label>
                <ColorInput name="textColor" defaultValue={defaultTheme.textColor} />
                <p className="text-[10px] text-gray-400 mt-1">デフォルトは白(#ffffff)です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">基本フォントサイズ (px)</label>
                <input type="number" name="baseFontSize" defaultValue={defaultTheme.baseFontSize} className="w-full border p-2 rounded text-sm bg-white" min="12" max="24" />
                <p className="text-[10px] text-gray-400 mt-1">UI全体の基準サイズ。デフォルトは16です。</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">カード・パネル表面色 (HEX)</label>
                <ColorInput name="surfaceColor" defaultValue={defaultTheme.surfaceColor} />
                <p className="text-[10px] text-gray-400 mt-1">リストの背景など。デフォルトはダークグレー(#111827)です。</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" name="enableNeon" defaultChecked={defaultTheme.enableNeon} className="w-5 h-5 accent-pink-600 rounded cursor-pointer" />
                <span className="text-sm font-bold text-gray-700">ネオン発光エフェクト (Cyberpunk Glow) を有効にする</span>
              </label>
              <p className="text-xs text-gray-500 pl-7 mb-4">OFFにすると、文字や枠線のドロップシャドウ（光る影）が消え、フラットでクリーンなデザインになります。サイバーパンク以外のテーマを作る際に有用です。</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">背景エフェクト</label>
                  <select name="bgEffect" defaultValue={defaultTheme.bgEffect || 'none'} className="w-full border p-2 rounded text-sm bg-white">
                    <option value="none">なし (None)</option>
                    <option value="scanline">ブラウン管・走査線 (CRT)</option>
                    <option value="grid">サイバー空間グリッド</option>
                    <option value="noise">フィルムグレイン (ノイズ)</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">背景に重ねる特殊エフェクト</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">UIの質感 (カード等)</label>
                  <select name="uiTexture" defaultValue={defaultTheme.uiTexture || 'solid'} className="w-full border p-2 rounded text-sm bg-white">
                    <option value="solid">ソリッド (標準)</option>
                    <option value="glass">グラスモーフィズム (すりガラス)</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">カードやヘッダーの背景の質感</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">角のスタイル</label>
                  <select name="cornerStyle" defaultValue={defaultTheme.cornerStyle || 'rounded'} className="w-full border p-2 rounded text-sm bg-white">
                    <option value="rounded">丸み (標準・角丸)</option>
                    <option value="sharp">シャープ (直角)</option>
                    <option value="pill">ピル型 (完全に丸い)</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">UI全体の角の丸み</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-500 block mb-1">メイン背景画像 (直リンクURL)</label>
              <input name="bgUrl" defaultValue={defaultTheme.bgUrl} placeholder="https://.../bg.jpg" className="w-full border p-2 rounded text-sm bg-white" />
              <p className="text-[10px] text-gray-400 mt-1">※空欄の場合はデフォルトの背景が使用されます</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">ロゴ画像 (直リンクURL)</label>
              <input name="logoUrl" defaultValue={defaultTheme.logoUrl} placeholder="https://.../logo.png" className="w-full border p-2 rounded text-sm bg-white" />
            </div>
            <button type="submit" className="bg-pink-600 text-white p-2 rounded hover:bg-pink-700 text-sm font-bold w-32 mt-2">デザインを保存</button>
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
            const lyricsTab = formData.get('lyricsTab') as string
            const analysisTab = formData.get('analysisTab') as string
            const analysisNote = formData.get('analysisNote') as string
            const disclaimer = formData.get('disclaimer') as string
            const entryPrefix = formData.get('entryPrefix') as string
            await updateEventConfig(id, 'labelConfig', { siteTitle, lyricsTab, analysisTab, analysisNote, disclaimer, entryPrefix })
          }} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">サイト表示タイトル (ヘッダー等)</label>
                <input name="siteTitle" defaultValue={defaultLabels.siteTitle} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">エントリーNo接頭辞(3文字)</label>
                <input name="entryPrefix" defaultValue={defaultLabels.entryPrefix} maxLength={3} className="w-full border p-2 rounded text-sm bg-white uppercase" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">タブ1 (デフォルト: LYRICS)</label>
                <input name="lyricsTab" defaultValue={defaultLabels.lyricsTab} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">タブ2 (デフォルト: 歌詞考察)</label>
                <input name="analysisTab" defaultValue={defaultLabels.analysisTab} className="w-full border p-2 rounded text-sm bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">考察タブの注意書き (小さく表示)</label>
              <input name="analysisNote" defaultValue={defaultLabels.analysisNote} className="w-full border p-2 rounded text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">楽曲詳細ページの免責事項 (フッター等)</label>
              <textarea name="disclaimer" defaultValue={defaultLabels.disclaimer} className="w-full border p-2 rounded text-sm bg-white h-20"></textarea>
            </div>
            <button type="submit" className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700 text-sm font-bold w-32">文言を保存</button>
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
            <label className="text-xs font-bold text-gray-500">スプレッドシート（CSVエクスポートURL）</label>
            <input name="value" defaultValue={currentSheetUrl} placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=..." className="border p-2 rounded text-sm bg-white" />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm font-bold">URLを保存</button>
          </form>

          <form action={updateEventSetting.bind(null, id, 'VOTE_URL')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-gray-500">投票フォームのURL</label>
            <input name="value" defaultValue={voteUrl} placeholder="https://docs.google.com/forms/d/..." className="border p-2 rounded text-sm bg-white" />
            <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 text-sm font-bold">投票URLを保存</button>
          </form>

          <form action={updateEventSetting.bind(null, id, 'YOUTUBE_PLAYLIST_URL')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-gray-500">YouTube再生リストURL</label>
            <input name="value" defaultValue={playlistUrl} placeholder="https://www.youtube.com/playlist?list=..." className="border p-2 rounded text-sm bg-white" />
            <button type="submit" className="bg-red-600 text-white p-2 rounded hover:bg-red-700 text-sm font-bold">再生リストURLを保存</button>
          </form>

          <form action={updateEventSetting.bind(null, id, 'SHARE_BASE_POST_URL')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-gray-500">𝕏共有時引用ポストURL</label>
            <input name="value" defaultValue={shareBasePostUrl} placeholder="https://x.com/username/status/..." className="border p-2 rounded text-sm bg-white" />
            <button type="submit" className="bg-sky-500 text-foreground p-2 rounded hover:bg-sky-600 text-sm font-bold">共有用URLを保存</button>
          </form>

          <form action={updateEventSetting.bind(null, id, 'CTA_BUTTON_MODE')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-gray-500">CTAボタンのモード</label>
            <select name="value" defaultValue={ctaMode} className="border p-2 rounded text-sm bg-white">
              <option value="hidden">非表示</option>
              <option value="apply">エントリーする（現在は非推奨）</option>
              <option value="vote">投票する</option>
              <option value="voting">投票中（集計用等）</option>
              <option value="result">結果発表へ</option>
            </select>
            <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 text-sm font-bold">CTAモードを保存</button>
          </form>

          <form action={async (formData) => {
            'use server'
            
            const enableRandomPlay = formData.get('enableRandomPlay') === 'true'
            const enableThumbSubmit = formData.get('enableThumbSubmit') === 'true'
            const enablePlaylistInfo = formData.get('enablePlaylistInfo') === 'true'
            const enableShowCreators = formData.get('enableShowCreators') === 'true'
            const enableArtistMain = formData.get('enableArtistMain') === 'true'
            const enableAwards = formData.get('enableAwards') === 'true'
            await updateEventConfig(id, 'featureFlags', { enableRandomPlay, enableThumbSubmit, enablePlaylistInfo, enableShowCreators, enableArtistMain, enableAwards })
          }} className="flex flex-col gap-2 pt-4 border-t">
            <h3 className="font-bold text-sm text-gray-700 mb-2">機能ON/OFF (Features)</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">ランダム再生ボタン</label>
                <select name="enableRandomPlay" defaultValue={defaultFeatures.enableRandomPlay ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">サムネイル投稿機能</label>
                <select name="enableThumbSubmit" defaultValue={defaultFeatures.enableThumbSubmit ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">有効 (ON)</option>
                  <option value="false">無効 (OFF)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">制作者名 表示設定</label>
                <select name="enableShowCreators" defaultValue={defaultFeatures.enableShowCreators ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">アーティストメイン表示</label>
                <select name="enableArtistMain" defaultValue={defaultFeatures.enableArtistMain ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">有効 (ON)</option>
                  <option value="false">無効 (OFF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">AWARDSボタン</label>
                <select name="enableAwards" defaultValue={defaultFeatures.enableAwards ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-gray-600 text-foreground p-2 rounded hover:bg-gray-700 text-sm font-bold mt-2 w-32">ON/OFFを保存</button>
          </form>

          <form action={updateEventSetting.bind(null, id, 'ENABLE_ILLUST_RECOMMEND')} className="flex flex-col gap-2 pt-4 border-t">
            <label className="text-xs font-bold text-gray-500">推しイラスト機能を有効にする</label>
            <select name="value" defaultValue={isIllustEnabled ? 'true' : 'false'} className="border p-2 rounded text-sm bg-white">
              <option value="true">有効</option>
              <option value="false">無効</option>
            </select>
            <button type="submit" className="bg-fuchsia-600 text-white p-2 rounded hover:bg-fuchsia-700 text-sm font-bold">推しイラスト設定を保存</button>
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
            <button type="submit" className="bg-blue-600 text-white p-2 rounded font-bold">追加する</button>
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
            <button type="submit" className="bg-green-600 text-white p-2 rounded font-bold">追加する</button>
          </form>
          <ul className="space-y-2">
            {event.schedules.map(s => (
              <li key={s.id} className="flex justify-between items-center border-b pb-2">
                <div><span className="text-gray-500">[{s.order}]</span> <b>{s.title}</b> : {s.date}</div>
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
            <button type="submit" className="bg-[var(--color-cyan-500)] text-white p-2 rounded font-bold">追加する</button>
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
            <button type="submit" className="bg-[var(--color-cyan-500)] text-white p-3 rounded-lg font-bold w-full hover:bg-[var(--color-cyan-500)] transition">
              スプレッドシートから最新データを取得・同期する
            </button>
          </form>

          <form action={async (formData) => {
            'use server'
            await syncOnlyEventAnalysisFromSheet(id, formData)
          }}>
            <button type="submit" className="bg-purple-100 text-purple-700 border border-purple-200 p-2 rounded-lg font-bold w-full hover:bg-purple-200 transition text-sm">
              楽曲考察のみを再同期する
            </button>
          </form>

          <div className="mt-8 text-sm font-bold border-b pb-2">
            登録されている楽曲数: <span className="text-[var(--color-cyan-400)] text-lg">{event.trackHonbans.length}</span> 曲
          </div>
          <ul className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
            {event.trackHonbans.map(t => (
              <li key={t.id} className="flex justify-between items-center border-b pb-4 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-200 px-1 rounded">No.{t.entryNo}</span>
                    <span className="font-bold">{t.title}</span>
                    {t.published ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full font-bold">公開中</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 rounded-full font-bold">非公開</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t.artistName || "匿名"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/${event.slug}/tracks/${t.id}`} target="_blank" className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">確認</a>
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
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
