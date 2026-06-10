
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const faqs = [
    {
      question: "動画の作成は必要ですか？",
      answer: "不要です。簡単な字幕入り動画を運営側で作成します。歌詞と曲以外の印象がつかないようにイラスト等も不要です。",
      order: 1
    },
    {
      question: "参加表明はする必要がありますか？",
      answer: "ありません。どちらかというと、誰にも言わず参加すること推奨です(笑)",
      order: 2
    },
    {
      question: "外部ツールを使ったマスタリングや調整はOKですか？",
      answer: "OKです。AIで作成した曲か確認のためにAIプラットフォームのURLを入力いただきます。",
      order: 3
    },
    {
      question: "インスト曲でもOKですか？",
      answer: "OKです。インスト曲の場合は公式サイトでは楽曲考察のみ表示されます。",
      order: 4
    },
    {
      question: "自分の曲に投票していいですか？",
      answer: "OKです。投票は一人３票を予定しています。",
      order: 5
    },
    {
      question: "イベント後の公開有無を非公開にした場合は、個人のポストによる公開もNGですか？",
      answer: "NGではありません。ただし公式サイト上では非公開のままです。",
      order: 6
    }
  ]

  console.log('FAQの復旧を開始します...')

  for (const faq of faqs) {
    await prisma.faq.create({
      data: faq
    })
  }

  console.log('復旧が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
