'use server'

export async function getNiconicoThumbnail(videoId: string): Promise<string | null> {
  if (!videoId.startsWith('sm') && !videoId.startsWith('nm') && !videoId.startsWith('so')) return null;
  
  try {
    const res = await fetch(`https://ext.nicovideo.jp/api/getthumbinfo/${videoId}`, {
      // 念のためキャッシュさせないか、少し長めのキャッシュにするか（今回はNext.jsの機能に任せる）
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) return null;
    const xml = await res.text();
    
    // サムネイルURLを抽出（Large版があればそれも抽出できたら良いが、基本は通常版で）
    const match = xml.match(/<thumbnail_url>(.*?)<\/thumbnail_url>/);
    if (match && match[1]) {
      // サムネイルに .L をつけると高画質になることが多いので、可能なら.Lつきも返す設定にできるが、
      // 表示できないと困るのでまずは通常のものを返す
      return match[1] + '.L'; // 昨今のニコニコは.Lをつけると大きいサムネイルが取れる
    }
    
    return null;
  } catch (e) {
    console.error('Failed to fetch Niconico thumbnail:', e);
    return null;
  }
}
