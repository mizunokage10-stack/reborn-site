import RebornShell from "@/components/reborn/shell";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PenSquare, Users, NotebookPen } from "lucide-react";

const pillars = [
  {
    title: "作品を読む",
    body: "作品を読むための場所は、いまではいくつもあります。それでも Reborn で読む意味があるとすれば、それは速度や話題性に押し流されず、一つの作品の前に静かに立ち止まれるからです。ここでは、読むことそのものが作品を支える行為であると考えています。",
    icon: BookOpen,
  },
  {
    title: "作品を寄せる",
    body: "作品を寄せることは、ただ投稿することではなく、この書架に一冊を置くことです。誰でも寄せることができますが、公開は確認制にすることで、無秩序に流れていく場ではなく、静かに本が並んでいく場を保ちます。",
    icon: PenSquare,
  },
  {
    title: "作品について集う",
    body: "作品は、一人で深く読むこともできますが、ときに誰かと向き合うことで別の顔を見せます。Reborn では、感想の消費ではなく、読書会や対話のようなかたちで、作品をめぐる時間そのものを共有できる場を育てていきたいと考えています。",
    icon: Users,
  },
  {
    title: "読みの記録を残す",
    body: "読まれた記録は、作品の外側にある補足ではなく、その作品が生きた痕跡でもあります。何を感じたか、どこで立ち止まったか、誰と読んだか。そうした記録もまた書架の一部として、作品のそばに静かに残していける場を目指しています。",
    icon: NotebookPen,
  },
];

export default function AboutPage() {
  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardContent className="max-w-3xl p-8 md:p-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold">About Reborn</h1>
              <p className="leading-8 text-stone-700">
                Reborn は、作品がただ消費されるのではなく、静かに読まれ、寄せられ、
                囲まれ、記録されるための場として構想されています。
              </p>
            </div>

            <div className="space-y-4 text-stone-700">
              <p className="leading-8">
                ここは、作品を読むためだけの場所ではありません。作品を寄せ、作品について集い、
                読みの記録を残していくための、文学のための静かな書架です。
              </p>
              <p className="leading-8">
                SNS の速度や数値の競争ではなく、一つの作品と向き合う時間そのものを大切にしたいと考えています。
                読者もまた、この場を支える一人です。
              </p>
            </div>

            <div className="grid gap-4">
              {pillars.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50">
                        <Icon className="h-5 w-5 text-stone-700" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-stone-900">{item.title}</h2>
                        <p className="leading-8 text-stone-600">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </RebornShell>
  );
}