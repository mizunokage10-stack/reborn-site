import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  return (
    <RebornShell>
      <div className="grid gap-4">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-8 md:p-10">
            <div className="max-w-3xl space-y-5">
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
      </div>
    </RebornShell>
  );
}