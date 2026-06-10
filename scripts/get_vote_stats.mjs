import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getStats() {
  try {
    const targetDate = process.argv[2]; // 第1引数: 日付
    const excludeSelf = process.argv[3] === 'true'; // 第2引数: 自投票除外フラグ

    // 全投票データと制作者データを取得
    const [allVotes, allTracks] = await Promise.all([
      prisma.vote.findMany({ orderBy: { timestamp: 'asc' } }),
      prisma.trackHonban.findMany()
    ]);

    // X IDを正規化する関数 (@やURLを除去)
    const normalizeX = (id) => {
      if (!id) return "";
      return id.toLowerCase()
        .replace(/https?:\/\/(x|twitter)\.com\//, "")
        .replace(/[@＠]/g, "") // 全角＠と半角@を除去
        .split("/")[0]
        .trim();
    };

    // 曲情報（EntryNoまたはタイトル）から制作者情報（IDとアーティスト名）を引くためのマップ
    const trackInfoMap = {};
    allTracks.forEach(t => {
      const normalizedId = normalizeX(t.xAccount);
      const info = { creatorId: normalizedId, artistName: t.artistName || "不明" };
      if (t.entryNo) trackInfoMap[t.entryNo.trim()] = info;
      if (t.title) trackInfoMap[t.title.trim()] = info;
    });

    // 集計ロジック
    const songs = new Set();
    const totals = {}; // { songTitle: { total: 0, self: 0 } }

    allVotes.forEach(vote => {
      const voteDate = vote.timestamp.split(' ')[0];
      
      // 日付指定がある場合、その日以降のデータは無視する（その時点での累計を出すため）
      if (targetDate && voteDate > targetDate) return;

      const song = vote.targetContent;
      songs.add(song);

      if (!totals[song]) totals[song] = { total: 0, self: 0 };
      
      // 自投票の判定
      let isSelf = false;
      const normalizedVoter = normalizeX(vote.voterName);
      // "No.001 Title" 形式から EntryNo を抽出
      const entryMatch = song.match(/No\.(\d+)/);
      const entryKey = entryMatch ? entryMatch[1] : null;
      
      const trackInfo = trackInfoMap[entryKey] || trackInfoMap[song];
      const creatorId = trackInfo?.creatorId;
      if (normalizedVoter && creatorId && normalizedVoter === creatorId) {
        isSelf = true;
      }

      // 自投票除外設定が有効で、かつ自投票判定された場合はカウントしない
      if (excludeSelf && isSelf) return;

      totals[song].total += 1;
      if (isSelf) totals[song].self += 1;
    });

    const label = targetDate ? `${targetDate} 時点` : "最新（全期間）";
    console.log(`\n=========================================`);
    console.log(`🏆 ${label} のランキング (全順位)`);
    console.log(`=========================================`);

    const ranking = Object.entries(totals)
      .map(([title, stats]) => ({ title, ...stats }))
      .sort((a, b) => b.total - a.total)
      .filter(r => r.total > 0);

    ranking.forEach((item, i) => {
      const selfText = item.self > 0 ? ` (うち自投票: ${item.self})` : "";
      const entryMatch = item.title.match(/No\.(\d+)/);
      const entryKey = entryMatch ? entryMatch[1] : null;
      const artist = trackInfoMap[entryKey]?.artistName || trackInfoMap[item.title]?.artistName || "不明";
      
      console.log(`${(i + 1).toString().padStart(3, ' ')}位: ${item.total.toString().padStart(3, ' ')}票${selfText.padEnd(15)} - [${artist}] ${item.title}`);
    });

    // 0票の未投票曲（未発掘曲）の抽出
    const unvotedTracks = allTracks.filter(t => {
      if (!t.entryNo) return false;
      const entryNoTrim = t.entryNo.trim();
      
      // どのカウント対象の投票にも選ばれていないかチェック
      const hasVotes = allVotes.some(v => {
        const voteDate = v.timestamp.split(' ')[0];
        if (targetDate && voteDate > targetDate) return false;

        // 自投票除外設定の適用
        let isSelf = false;
        const normalizedVoter = normalizeX(v.voterName);
        const song = v.targetContent;
        const entryMatch = song.match(/No\.(\d+)/);
        const entryKey = entryMatch ? entryMatch[1] : null;
        
        const trackInfo = trackInfoMap[entryKey] || trackInfoMap[song];
        const creatorId = trackInfo?.creatorId;
        if (normalizedVoter && creatorId && normalizedVoter === creatorId) {
          isSelf = true;
        }
        if (excludeSelf && isSelf) return false;

        return entryKey === entryNoTrim || song.trim() === t.title.trim();
      });
      return !hasVotes;
    });

    if (unvotedTracks.length > 0) {
      console.log(`\n-----------------------------------------`);
      console.log(`🔍 本投票でまだ1票も入っていない未発掘曲 (${unvotedTracks.length}曲)`);
      console.log(`-----------------------------------------`);
      unvotedTracks
        .sort((a, b) => (a.entryNo || "").localeCompare(b.entryNo || ""))
        .forEach(t => {
          console.log(`  0票 - [${t.artistName || "不明"}] No.${t.entryNo || "---"} ${t.title}`);
        });
    }

    console.log("\n=========================================");
    console.log(`✅ ${label} の集計が完了しました`);
    console.log("=========================================");

  } catch (error) {
    console.error("エラー:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getStats();
