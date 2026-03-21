import RebornShell from "@/components/reborn/shell";
import { sampleWorks } from "@/lib/sample-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <RebornShell>
      <div className="grid gap-4">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-8 md:p-10">
            <div className="max-w-3xl space-y-5">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                人間を読むための図書館
              </Badge>
              <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                誰でも寄せられ、誰でも読める、
                <br />
                文学のための静かな書架。
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                Reborn は、作品を読むためだけでなく、作品を寄せ、作品について集い、読みの記録を残していくための場です。
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-2xl">
                  <Link href="/works">作品を読む</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link href="/submit">作品を寄せる</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "作品を読む", body: "投稿作品を、静かな可読性を重視した画面で読むことができます。" },
            { title: "作品を寄せる", body: "誰でも作品を送れます。公開は審査制で、書架の静けさを保ちます。" },
            { title: "読みの記録を残す", body: "将来的に読書会や記録特集を通して、作品の読まれ方も棚に残していきます。" },
          ].map((item) => (
            <Card key={item.title} className="rounded-3xl border-stone-200 shadow-sm">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="leading-7 text-stone-600">{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>新着作品</CardTitle>
            <CardDescription>最近公開された作品</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {sampleWorks.slice(0, 3).map((work) => (
              <div key={work.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-medium">{work.title}</div>
                  <Badge variant="outline" className="rounded-full">{work.category}</Badge>
                </div>
                <div className="mb-2 text-sm text-stone-500">{work.author} ・ {work.date}</div>
                <p className="text-sm leading-6 text-stone-700">{work.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}