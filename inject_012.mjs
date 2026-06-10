import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "012";
  const analysis = `### 🌐 テーマ分析
**「自律的発光とシステムからの離反」**
資本主義やデジタル社会が押し付ける「自分を愛せ」という空虚で安っぽい標語に対し、痛みを伴う自己変革と、自律的な「自光（Self-luminescent）」による抵抗を描いています。既製品（Product）であることを拒絶し、自分自身を再設計（Rewrite the design）しようとする、サイバーパンクな実存主義がテーマの核心です。

### ⚙️ 歌詞の工夫点
「digital cages」「plastic gospel」「static in the stream」といったデジタル用語と宗教的メタファーを配置し、高度に洗練された「管理される自由」の不気味さを表現しています。英語と日本語の共存が、外面的なパッケージと内面的な真実の乖離を象徴しており、孤独な残響を「終わりを告げる焔」へと変えていくドラマチックな構成が、聴き手に強い覚悟を促します。

### 🎤 注目すべきパンチライン
**「My raw scars are stars / Self-luminescent, I rewrite the design」**
（剥き出しの傷跡が、星座のように繋がりだす / 自ら光を放ち、私は私を書き換える）
かつて恥ずべき「欠損」や「バグ」とみなされていた傷跡を、逆転の発想で自らを導く「星座」へと転換させる力強いフレーズ。他者の用意した設計図を破り捨て、自らの内なる情熱（自光）で自分の人生を定義し直す、真に自立した個の誕生を鮮烈に宣言しています。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 3 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
