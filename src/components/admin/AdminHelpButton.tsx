'use client';

import React, { useState } from 'react';

type HelpKey = 
  | 'basic-info'
  | 'appearance'
  | 'labels'
  | 'host'
  | 'features'
  | 'news'
  | 'schedule'
  | 'rules'
  | 'faq'
  | 'tracks';

const helpContents: Record<HelpKey, { title: string; target: string; desc: string; example: React.ReactNode }> = {
  'basic-info': {
    title: '基本情報 (Basic Info)',
    target: 'サイト全体のタイトルやURL、各種ページの「募集要項」などのセクション。',
    desc: 'イベントの根幹となる情報です。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>イベント名:</b> AI-anonymous MUSIC FES.</li>
        <li><b>URL Slug:</b> aianonymous2 <br/><span className="text-gray-500 text-xs">サイトのURLが yourdomain.com/aianonymous2 になります。</span></li>
        <li><b>セクション見出し:</b> 募集要項 や イベントについて など</li>
      </ul>
    )
  },
  'appearance': {
    title: 'デザイン・見た目 (Appearance)',
    target: 'サイト全体の背景色、ボタンの色、文字色、ヘッダーに表示されるロゴ画像など。',
    desc: 'サイトのテーマカラーを決定します。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>メインカラー:</b> #00f0ff (水色など)</li>
        <li><b>ネオン発光エフェクト:</b> ONにするとサイバーパンク風の光る影が付きます。</li>
        <li><b>ロゴ画像URL:</b> https://.../logo.png <br/><span className="text-gray-500 text-xs">XやDiscordにアップロードした画像の直接リンク(URL)等</span></li>
      </ul>
    )
  },
  'labels': {
    title: '文言・ラベル (Labels)',
    target: '楽曲詳細ページの「LYRICS」「歌詞考察」タブや、ページ下部の免責事項。',
    desc: 'デフォルトの表記をイベントのトーンに合わせて変更できます。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>タブ1:</b> LYRICS や 歌詞</li>
        <li><b>免責事項:</b> 【免責事項】この考察はAIによる解釈であり...</li>
      </ul>
    )
  },
  'host': {
    title: '主催者・メンバー (Host Settings)',
    target: 'トップページの下部（フッターの少し上）。',
    desc: 'イベント運営者やイラストレーター、サポーターなどを紹介するエリアの表示を管理します。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>役職:</b> 主催、イラスト担当、サポーター など</li>
        <li><b>X URL:</b> https://x.com/username <br/><span className="text-gray-500 text-xs">アイコンをクリックしたときの飛び先リンクになります。</span></li>
      </ul>
    )
  },
  'features': {
    title: '機能設定 (Settings / Features)',
    target: 'トップページや各画面のボタン・機能の表示/非表示、および各種外部連携リンク。',
    desc: 'イベントの進行状況に合わせて、必要な機能のON/OFFやリンク先を一括管理します。',
    example: (
      <ul className="list-disc pl-5 space-y-2 text-xs">
        <li><b>スプレッドシート(CSVエクスポートURL):</b> 楽曲データ（CSV）を自動取得するためのGoogleスプレッドシートの公開URLを設定します。</li>
        <li><b>投票フォームのURL:</b> Googleフォームなどの投票用URL。CTAボタンや各曲の投票ボタンのリンク先になります。</li>
        <li><b>YouTube再生リストURL:</b> 全曲を一気見できるYouTubeの再生リストURL。ヘッダーの「▶再生リスト」ボタンなどに反映されます。</li>
        <li><b>𝕏共有時引用ポストURL:</b> 曲をシェアする際、引用リポストの元となる公式のポスト（ツイート）URLを設定します。</li>
        <li><b>CTAボタンのモード:</b> トップページ最上部の大きな誘導ボタンの役割を切り替えます。（例：「投票する」モードにすると投票フォームへ誘導）</li>
        <li><b>ランダム再生ボタン:</b> ONにするとヘッダー右上に「🎲 ランダム」ボタンが出現し、曲をシャッフル再生できます。</li>
        <li><b>サムネイル投稿機能:</b> （※現在非推奨）参加者がサムネイル画像を投稿できる機能のON/OFF。</li>
        <li><b>制作者名 表示設定:</b> OFFにすると、楽曲一覧や詳細ページで制作者の名前が隠れ「匿名」として表示されます。（アノニマス期間用）</li>
        <li><b>アーティストメイン表示:</b> ONにすると、「推しリスト」などの表記が「気になるした参加者（アーティスト）」主体に切り替わります。</li>
        <li><b>AWARDSボタン:</b> ONにすると、ヘッダーに「AWARDS（結果発表）」ページへのリンクが表示されます。</li>
        <li><b>推しイラスト機能を有効にする:</b> ONにすると、「推しリスト」ページ内に「イラストリスト」への切り替えタブが表示されます。</li>
      </ul>
    )
  },
  'news': {
    title: 'お知らせ (News)',
    target: 'トップページ上部の「NEWS」セクション。',
    desc: '参加者への告知事項（追加情報、訂正など）を時系列で表示します。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>タイトル:</b> エントリー受付を開始しました！</li>
        <li><b>内容:</b> 募集期間は〇月〇日までとなります。詳しくは募集要項をご覧ください。</li>
      </ul>
    )
  },
  'schedule': {
    title: 'スケジュール (Schedule)',
    target: 'トップページ中部の「SCHEDULE」セクション。',
    desc: 'イベントのタイムライン（開催期間、投票期間、結果発表など）を表示します。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>イベント名:</b> 楽曲募集開始</li>
        <li><b>日時:</b> 2024/05/01 19:00</li>
        <li><b>並び順:</b> 1 <br/><span className="text-gray-500 text-xs">数字が小さい順に上から表示されます。</span></li>
      </ul>
    )
  },
  'rules': {
    title: '募集内容 (Rules)',
    target: 'トップページの「募集要項 / イベントについて」セクション。',
    desc: 'HTMLタグを一部使用して、イベントのルールやコンセプトをリッチに説明できます。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>タイトル:</b> フェスコンセプト</li>
        <li><b>アイコン:</b> ✨</li>
        <li><b>内容:</b> &lt;b&gt;AIを使った音楽フェスです！&lt;/b&gt; のようにタグを使えます。</li>
      </ul>
    )
  },
  'faq': {
    title: 'よくある質問 (FAQ)',
    target: 'トップページ下部の「FAQ」セクション。',
    desc: 'Q&A形式でユーザーの疑問を解消します。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>質問:</b> AIツールは何を使っても良いですか？</li>
        <li><b>回答:</b> はい、SunoやUdioなどお好きなツールをご利用いただけます。</li>
      </ul>
    )
  },
  'tracks': {
    title: '楽曲データ同期 (Tracks)',
    target: 'トップページの楽曲一覧、および各楽曲詳細ページ。',
    desc: 'スプレッドシートから最新の参加楽曲データやAI考察データを取得して、サイトに反映します。手動での公開/非公開の切り替えもここで行います。',
    example: (
      <ul className="list-disc pl-5 space-y-1">
        <li><b>更新スタートNo:</b> 途中から追加分だけを同期したい場合に、エントリーNoを指定します。通常は自動でセットされます。</li>
        <li><b>公開する/非公開へ:</b> 特定の楽曲だけを一時的に非公開にすることができます。</li>
      </ul>
    )
  }
};

export default function AdminHelpButton({ contentKey }: { contentKey: HelpKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const content = helpContents[contentKey];

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors ml-2 shadow-sm"
        title="この設定のヘルプを見る"
      >
        <span className="text-xs font-black">?</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white border-2 border-gray-200 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
              <span className="text-blue-500">❓</span> {content.title}
            </h3>

            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  どこに反映されるか
                </h4>
                <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {content.target}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  設定の役割
                </h4>
                <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {content.desc}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  入力例
                </h4>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100/50 leading-relaxed">
                  {content.example}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
