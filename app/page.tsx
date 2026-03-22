import RebornShell from "@/components/reborn/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, PenSquare, Users, NotebookPen } from "lucide-react";

const pillars = [
  {
    title: "作品を読む",
    body: "静かな画面で、寄せられた作品をゆっくり辿ることができます。",
    icon: BookOpen,
    href: "/works",
  },
  {
    title: "作品を寄せる",
    body: "誰でも作品を送れます。公開は確認制で、書架の静けさを保ちます。",
    icon: PenSquare,
    href: "/submit",
  },
  {
    title: "作品について集う",
    body: "将来的に読書会や小さな対話の場を通して、作品をめぐる時間を育てます。",
    icon: Users,
    href: "/about",
  },
  {
    title: "読みの記録を残す",
    body: "読まれた痕跡や記録もまた、作品のそばに静かに残していきます。",
    icon: NotebookPen,
    href: "/about",
  },
];

export default async function HomePage() {
  return (
    <RebornShell>
      <div className="grid gap-6">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-8 md:p-12">
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <div className="space-y-3">
                <div className="text-sm tracking-[0.18em] text-stone-500">
                  文学のための静かな書架
                </div>
                <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                  誰でも寄せられ、誰でも読める。
                </h1>
              </div>
              <p className="mx-auto max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                Reborn は、作品を読み、寄せ、記録していくための場です。
              </p>
              <div className="flex flex-col items-center justify-center gap-3">
                <Button asChild className="rounded-2xl px-8">
                  <Link href="/works">書架を開く</Link>
                </Button>
                <Link
                  href="/submit"
                  className="text-sm font-medium text-stone-600 underline-offset-4 transition hover:text-stone-950 hover:underline"
                >
                  作品を寄せたい方はこちら
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.title} href={item.href} className="block">
                <Card className="rounded-3xl border-stone-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50">
                        <Icon className="h-5 w-5 text-stone-700" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-stone-900">{item.title}</h2>
                        <p className="text-sm leading-7 text-stone-600">{item.body}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </RebornShell>
  );
}