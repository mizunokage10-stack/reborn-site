import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PublishedWork = {
  id: number;
  title: string;
  pen_name: string;
  category: string;
  summary: string | null;
  content: string;
  status: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugify(title: string, id: number) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return base ? `${base}-${id}` : `work-${id}`;
}

export default async function HomePage() {
  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, pen_name, category, summary, content, status, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestWorks: PublishedWork[] = data ?? [];

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
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                新着作品の読み込みに失敗しました: {error.message}
              </div>
            )}

            {!error && latestWorks.length === 0 && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                まだ公開された作品はありません。
              </div>
            )}

            {latestWorks.map((work) => (
              <div key={work.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-medium">{work.title}</div>
                  <Badge variant="outline" className="rounded-full">{work.category}</Badge>
                </div>
                <div className="mb-2 text-sm text-stone-500">
                  {work.pen_name} ・ {new Date(work.created_at).toLocaleDateString("ja-JP")}
                </div>
                <p className="mb-3 text-sm leading-6 text-stone-700">
                  {work.summary || (work.content.length > 100 ? `${work.content.slice(0, 100)}…` : work.content)}
                </p>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link href={`/works/${slugify(work.title, work.id)}`}>読む</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}