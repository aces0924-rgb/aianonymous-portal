import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { twitterId } = await request.json();
    if (!twitterId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const twitterIdNormalized = twitterId.toLowerCase().trim().replace(/^@/, '');

    // LOCK状態のレコードを削除
    await prisma.trackThumbnail.deleteMany({
      where: {
        twitterId: twitterIdNormalized,
        status: 'LOCK'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
