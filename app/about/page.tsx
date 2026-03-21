import RebornShell from "@/components/reborn/shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardContent className="max-w-3xl p-8 md:p-10">
          <div className="space-y-6">
            <div>
              <h1 className="mb-3 text-3xl font-semibold">About Reborn</h1>
              <p className="leading-8 text-stone-700">
                Reborn は、作品がただ消費されるのではなく、静かに読まれ、寄せられ、
                囲まれ、記録されるための場として構想されています。
              </p>
            </div>

            <div className="space-y-4 text-stone-700 leading-8">
              <p>
                ここは、作品を読むためだけの場所ではありません。作品を寄せ、作品について集い、
                読みの記録を残していくための、文学のための静かな書架です。
              </p>
              <p>
                SNS の速度や数値の競争ではなく、一つの作品と向き合う時間そのものを大切にしたいと考えています。
                読者もまた、この場を支える一人です。
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "作品を読む",
                "作品を寄せる",
                "作品について集う",
                "読みの記録を残す",
              ].map((item, index) => (
                <div key={item} className="rounded-2xl border border-stone-200 p-4">
                  <div className="mb-1 text-sm text-stone-500">柱 {index + 1}</div>
                  <div className="font-medium">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </RebornShell>
  );
}