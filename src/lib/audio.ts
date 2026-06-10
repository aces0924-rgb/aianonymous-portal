/**
 * Google Driveの共有用URLを、自作のAPIプロキシ（ブラウザ制限回避用）URLに変換します。
 */
export function getDirectStreamUrl(url: string | null): string | null {
  if (!url) return null;

  // Google DriveのファイルIDを抽出する正規表現
  const driveIdMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
  
  if (driveIdMatch && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    const fileId = driveIdMatch[1];
    // Vercelの帯域幅制限(10GB)を回避するため、直リンクを使用します
    return `https://docs.google.com/uc?id=${fileId}&export=download`;
  }

  // すでにプロキシURLや直リンクっぽい場合はそのまま返す
  if (url.startsWith('/api/audio/') || url.match(/\.(mp3|wav|ogg|m4a)$/)) {
    return url;
  }

  return url; // 判別できない場合はそのまま返す（フォールバック）
}
