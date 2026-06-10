import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "6";
  const timestamp = "2026/04/15 18:17:02";

  const sheetReview = `■ジャンル
J-POP／ダンスポップ、アニソン

■曲のイメージ
きらびやかで華やかなパーティーのような空気感の中に、どこかひやりとした孤独が混ざっているような、不思議な魅力があるね。全体的に音がキラキラしていて、お城の中で踊っているような躍動感を感じるよ。ボーカルの声質はとても透明感があって、お嬢様らしい気品を感じさせる一方で、ふとした瞬間に見せる幼さや、何かにすがりたいような切実な響きが耳に残るんだ。シンセサイザーの軽快な音の重なりが、お嬢様の華やかな日常を鮮やかに彩っているけれど、その裏側にある不安定な心情を映し出すような、鋭いアクセントも効いているね。

■曲と歌詞の親和性
歌詞の内容とメロディのギャップが、この曲の最大の面白さだと思うよ。誰が見ても幸せそうな「お嬢さまライフ」の中で、ケーキのサイズやキャビアの粒の小ささに本気で絶望している姿が、ドラマチックなメロディに乗ることで、滑稽でありながらもどこか愛おしく感じられるんだ。デパスちゃんやセバスチャンといった、彼女にとっての救いに向ける歌声は、明るいリズムの中で少しだけ熱を帯びていて、彼女の心の隙間が音で埋められていく様子が伝わってくるよ。わがままなようでいて、実はとても繊細な女の子の心の揺れが、弾けるようなポップなサウンドと完璧に溶け合っているね。`;

  console.log(`Updating review for No.${entryNo} with spreadsheet content.`);

  const updatedTrack = await prisma.track.update({
    where: { timestamp: timestamp },
    data: { 
      review: sheetReview
    }
  });

  console.log("Review updated successfully for:", updatedTrack.title);
}

main()
  .catch(err => {
    console.error("Update Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
