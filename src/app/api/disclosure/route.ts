import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entryNo, email, password } = body;

    if (!entryNo || !email || !password) {
      return NextResponse.json(
        { error: '楽曲No、メールアドレス、パスワードはすべて必須です。' },
        { status: 400 }
      );
    }

    // 入力された楽曲Noを0埋め3桁に正規化
    const normalizedEntryNo = String(parseInt(entryNo, 10)).padStart(3, '0');

    // VoteDisclosureから該当レコードを検索
    const disclosureRecord = await prisma.voteDisclosure.findFirst({
      where: {
        entryNo: normalizedEntryNo,
        email: email,
        password: password,
      }
    });

    if (!disclosureRecord) {
      return NextResponse.json(
        { error: '入力された情報が間違っているか、登録されていません。' },
        { status: 401 }
      );
    }

    if (!disclosureRecord.wantsDisclosure) {
      return NextResponse.json(
        { error: '事前の申請で「個別開示を希望しない（NG）」に設定されています。' },
        { status: 403 }
      );
    }

    // 開示希望OKの場合、VoteResultから結果を取得
    const resultRecord = await prisma.voteResult.findUnique({
      where: {
        trackId: (await prisma.trackHonban.findFirst({ where: { entryNo: normalizedEntryNo } }))?.id || -1
      }
    });
    
    // TrackIdが見つからない、またはVoteResultがまだ無い場合へのフォールバック。
    // VoteResultにはentryNo自体も持っているはずなので、そちらでも検索。
    const finalResult = resultRecord || await prisma.voteResult.findFirst({
      where: { entryNo: normalizedEntryNo }
    });

    if (!finalResult) {
      return NextResponse.json(
        { error: '投票結果がまだ集計されていないか、見つかりません。' },
        { status: 404 }
      );
    }

    // 成功: 順位や票数を返す
    return NextResponse.json({
      success: true,
      data: {
        entryNo: finalResult.entryNo,
        title: finalResult.title,
        artistName: finalResult.artistName,
        rank: finalResult.rank,
        totalVotes: finalResult.totalVotes,
      }
    });

  } catch (error) {
    console.error('Disclosure API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
