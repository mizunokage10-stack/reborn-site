import RebornShell from "@/components/reborn/shell";
import { sampleWorks } from "@/lib/sample-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = sampleWorks.find((item) => item.slug === slug) ?? sampleWorks[0];

  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardContent className="p-8 md:p-10">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-3 border-b border-stone-200 pb-6">
              <Badge variant="secondary" className="rounded-full">{work.category}</Badge>
              <h1 className="text-3xl font-semibold leading-tight">{work.title}</h1>
              <div className="text-sm text-stone-500">{work.author} ・ {work.date}</div>
              <p className="leading-7 text-stone-600">{work.summary}</p>
            </div>

            <div className="space-y-5 text-[15px] leading-8 text-stone-800 md:text-base">
              <p>海辺の町では、言葉が潮に濡れる。ひとたび口にしたはずの名は、翌朝になると別の生き物のように姿を変え、昨日まで家族を指していた呼び名が、今日はただの風の癖になる。</p>
              <p>私はその変化を恐れていたのではない。むしろ、変わらずに残ることの方を恐れていた。輪郭が保たれたままのものは、いずれ制度の硬さを帯び、こちらの皮膚まで固めてしまう気がしたからだ。</p>
              <p>鯨の骨のように白い雲が流れていく午後、浜辺で拾った石を一つだけポケットに入れた。帰ってから机の上に置いてみると、それは石ではなく、まだ誰にも呼ばれていない小さな器官のようにも見えた。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </RebornShell>
  );
}