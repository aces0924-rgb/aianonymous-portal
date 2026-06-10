# AI-anonymous MUSIC FES 現行システム仕様書 (2026-05-20時点)

本ドキュメントは、現在稼働している「AI-anonymous MUSIC FES（アノニマスフェス）」のWebシステムおよび関連ツールの仕様をまとめた設計書です。

---

## 1. システム全体概要

- **目的**: 音楽そのものの魅力だけで繋がる完全制作者匿名のボカロAI音楽祭の運営・公開サイト。
- **技術スタック**:
  - **フロントエンド**: Next.js 15 (App Router, Tailwind CSS, TypeScript)
  - **データベース**: Prisma (ORM) + PostgreSQL (Vercel Postgres/Supabase)
  - **ホスティング**: Vercel

---

## 2. データベース設計 (Prisma Schema)

データベースには、設定、お知らせ、スケジュール、楽曲データ、投票、サムネイル投稿など12のモデルが存在します。

```mermaid
erDiagram
    Event ||--o{ Track : "将来の拡張"
    TrackHonban ||--o| TrackThumbnail : "1対1 (本番用)"
    Track ||--o| TrackThumbnail : "1対1 (選考用)"
    
    News {
        Int id PK
        String title
        String content
        DateTime createdAt
    }
    Schedule {
        Int id PK
        String title
        String date
        Int order
    }
    Track {
        Int id PK
        String timestamp
        String xAccount
        String title
        String songUrl
        String audioUrl
        String lyrics
        String artistName
        String email
        String analysis
        String review
        String genre
        Boolean published
        String entryNo
    }
    TrackHonban {
        Int id PK
        String title
        String songUrl
        String audioUrl
        String lyrics
        String analysis
        String review
        String genre
        Boolean published
        String entryNo
    }
    Setting {
        String key PK
        String value
    }
    TrackThumbnail {
        Int id PK
        Int trackId UNIQUE
        String entryNo
        String trackTitle
        String artistName
        String twitterId
        Boolean isAnonymous
        String status
        String driveFileId
    }
```

### 主要テーブル定義と役割
1. **`News`**: トップページに表示するお知らせ。
2. **`Schedule`**: イベントスケジュール（タイムライン表示用）。
3. **`Track` / `TrackHonban` (track_honban)**: 
   - エントリー楽曲データ。選考用と本番用にテーブルが分かれています。
   - `analysis` にAIによる歌詞考察、`review` に楽曲考察テキストを格納。
4. **`Setting`**: 
   - キーバリュー形式の全体設定。
   - `ACTIVE_TRACK_TABLE`: 表示するテーブルの切り替え (`"track"` または `"track_honban"`)。
   - `CTA_BUTTON_MODE`: トップページのボタン表示切り替え (`"apply"` 応募 / `"vote"` 投票 / `"hidden"` 非表示)。
   - その他 `VOTE_URL`, `YOUTUBE_PLAYLIST_URL`, `SHARE_BASE_POST_URL` などを保持。
5. **`TrackThumbnail`**:
   - ユーザー（絵師）から投稿されたファンアートサムネイルの管理。
   - `status`: 予約および承認の管理ステータス (`"LOCK"`, `"PENDING"`, `"APPROVED"`, `"REJECTED"`)。
6. **`Vote`**: 投票データの集計管理。
7. **`PremiereSchedule`**: YouTubeプレミア配信の日程・時間および対象の楽曲範囲の管理。
8. **`UserPlaylist` / `UserPlaylistSub`**: 一般ユーザーやキュレーターが作成する「推しリスト（プレイリスト）」の保持。

---

## 3. 画面・ページ構成

### ① トップページ (エントランス): `/`
- **ヘッダー**: 各セクション（お知らせ、スケジュール、募集要項、よくある質問、主催者）へのスムーズなアンカー遷移リンク。
- **ヒーローエリア**:
  - `CTAボタン`: 設定（`CTA_BUTTON_MODE`）に応じて動的に「応募する」「投票する」「非表示」に変化。
  - `YouTube再生リストボタン`: 設定から登録されたプレイリストへの直リンク。
  - `ランダム再生ボタン`: 投稿された全楽曲からランダムで1曲を裏再生、または詳細へジャンプ。
- **各セクション**:
  - `NEWS`: Prismaから取得した最新のお知らせを表示。
  - `SCHEDULE`: 縦型タイムラインでイベント日程を表示。
  - `GUIDELINES`: 募集要項・免責事項。アノニマス（匿名）ポリシーを明記。
  - `FAQ`: よくある質問。
  - `HostSection`: 主催者の情報。

### ② 楽曲一覧ページ: `/tracks`
- エントリーされたすべての公開済み楽曲をカード形式で一覧表示。
- **お気に入り（推し）機能**: クライアント側のローカルストレージと連動し、自分だけのプレイリストを作成可能。
- **フィルター**: ジャンルによる絞り込み機能。
- **ファンアート募集中バッジ**: その楽曲に承認済みのサムネイルが存在しない場合、「ファンアート募集中」のバッジを表示。

### ③ 楽曲詳細ページ: `/tracks/[id]`
- **オーディオプレイヤー**: `GlobalPlayer` と連動し、ストリーミング再生。
- **歌詞表示**: 歌詞テキストの表示（最大高さ600pxに拡大、カスタムスクロールバー）。
- **匿名ポリシー免責（Anonymity Disclaimer）**: 「SNS等での制作者特定や推測はお控えください」との警告文を固定表示。
- **サムネイル（ファンアート）投稿ボタン**:
  - まだサムネイルが採用されていない場合、`/submit-thumbnail` への投稿ボタンを表示。
  - すでに採用・承認されている場合は「サムネイル採用済み（チェック）」をグレーアウト表示。
- **考察セクション (`AnalysisTabs`)**:
  - `歌詞考察`（AI生成テキスト）と`楽曲考察`（登録テキスト）をタブ切り替えで表示。

### ④ サムネイル投稿フォーム: `/submit-thumbnail`
- 楽曲に対するファンアート（サムネイル画像）の投稿と予約枠（LOCK）の管理。
- **仕様ルール**:
  - ファイルサイズ上限: **4MB**（WebUIのUX向上のため）。
  - アップロード先: Google Drive API 経由で、サーバーアクションから指定フォルダへ直接アップロード。

---

## 4. 特徴的なシステムロジック

### 1) グローバルプレイヤーのチラつき・消滅バグ防止
- **課題**: 楽曲詳細や一覧で再生ボタンを押した際、再レンダリングのたびにプレイヤーが消える不具合があった。
- **対策**: `PlayerContext.tsx` 内の `playTrack` / `closePlayer` 関数を `useCallback` でメモ化。`GlobalPlayer.tsx` 側で実際に `pathname`（URLパス）が変更された時のみプレイヤーのリセットが走るよう、`useRef` を使ってガードを実装。

### 2) モバイル端末での投稿予約（LOCK）解除制御
- **課題**: モバイルブラウザでサムネイル投稿中に、ユーザーがブラウザをバックグラウンドに引っ込めたり閉じたりした際、予約ロック（LOCKステータス）がDBに残ったままになり他のユーザーが投稿できなくなる。
- **対策**: `pagehide` イベントハンドラと、`fetch` の `keepalive: true` オプションを組み合わせて実装。接続が切断される寸前に、サーバーに対して予約解除（アンロック）のAPIリクエストを確実に送信する仕組み。

### 3) プレビューモードの実装
- `?preview=honban` のURLパラメータを付与することで、一般ユーザーにはまだ「選考用（`track`）」が表示されている状態でも、管理者や関係者だけが本番用テーブル（`track_honban`）の画面表示と挙動を確認できる仕組み。

---

## 5. 6月6日以降の「汎用ポータル化」への設計方針

既存のアノニマスフェスが終了したのち、以下の手順でシステムを汎用イベントポータルへアップグレードします。

1. **既存リポジトリの複製**:
   - `vocaloid-ai-event` を丸ごとコピーし、データベース（接続文字列）も完全に分離した開発環境を構築（２重管理で本番への悪影響を完全に防ぐ）。
2. **`Event` テーブルの追加**:
   - 各モデル（`Track`, `News`, `Schedule`, `Faq` など）に `eventId` を持たせ、すべてのデータをイベントごとに切り分けられるマルチテナント構造にリファクタリング。
3. **設定（Setting）テーブルのポータル管理**:
   - 各イベントの config (テーマカラー、ロゴ、表示文言、機能フラグ) を JSON形式で `Event` テーブルまたは管理用設定に持たせ、コードの変更なしにイベントの切り替えができるように設計。
4. **表示項目の汎用コントロール**:
   - 「歌詞考察」→「アーティスト概要」などのラベル表示を、Prismaまたは `event.config.json` から動的に引っ張るようにし、各種セクションのON/OFFもフラグ制御できるように変更。
