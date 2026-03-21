import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent } from "@/components/ui/card";
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

function extractIdFromSlug(slug?: string) {
  if (!slug) return null;
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function coverStyle(category: string) {
  const presets: Record<string, string> = {
    小説: "from-slate-700 via-slate-800 to-slate-950",
    日記: "from-amber-700 via-orange-800 to-stone-950",
    文芸批評: "from-emerald-700 via-teal-800 to-slate-950",
    俳句: "from-indigo-700 via-violet-800 to-slate-950",
    絵: "from-fuchsia-700 via-purple-800 to-slate-950",
  };

  return presets[category] ?? "from-stone-700 via-stone-800 to-stone-950";
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    小説: "物語の棚",
    日記: "日々の棚",
    文芸批評: "批評の棚",
    俳句: "短詩の棚",
    絵: "図像の棚",
  };

  return labels[category] ?? "寄せられた棚";
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const id = extractIdFromSlug(resolvedParams?.slug);

  if (!id) {
    return (
      <RebornShell>
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-8 md:p-10">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="text-2xl font-semibold">作品が見つかりません</h1>
              <p className="leading-7 text-stone-600">
                URL が正しくないか、この作品はまだ公開されていません。
              </p>
            </div>
          </CardContent>
        </Card>
      </RebornShell>
    );
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, pen_name, category, summary, content, status, created_at")
    .eq("id", id)
    .eq("status", "published")
    .single();

  const work: PublishedWork | null = data ?? null;

  if (error || !work) {
    return (
      <RebornShell>
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-8 md:p-10">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="text-2xl font-semibold">作品が見つかりません</h1>
              <p className="leading-7 text-stone-600">
                この作品は存在しないか、まだ公開されていません。
              </p>
            </div>
          </CardContent>
        </Card>
      </RebornShell>
    );
  }

  return (
    <RebornShell>
      <div className="grid gap-6">
        <Card className="overflow-hidden rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-[320px_1fr]">
              <div className={`relative flex min-h-[420px] flex-col justify-between bg-gradient-to-b ${coverStyle(work.category)} p-8 text-stone-100`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-6 top-0 h-full w-px bg-white/30" />
                  <div className="absolute right-6 top-0 h-full w-px bg-black/30" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
                </div>

                <div className="relative z-10 flex items-start justify-between gap-4 text-xs uppercase tracking-[0.25em] text-stone-200/80">
                  <span>Reborn</span>
                  <span>{categoryLabel(work.category)}</span>
                </div>

                <div className="relative z-10 space-y-6 py-10">
                  <div className="text-xs uppercase tracking-[0.25em] text-stone-200/80">
                    {work.category}
                  </div>
                  <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                    {work.title}
                  </h1>
                </div>

                <div className="relative z-10 border-t border-white/20 pt-4 text-sm leading-6 text-stone-200/90">
                  <div>{work.pen_name}</div>
                  <div>{new Date(work.created_at).toLocaleDateString("ja-JP")}</div>
                </div>
              </div>

              <div className="bg-white p-8 md:p-10">
                <div className="mx-auto max-w-2xl space-y-8">
                  <div className="space-y-4 border-b border-stone-200 pb-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="rounded-full">
                        {work.category}
                      </Badge>
                      <span className="text-sm text-stone-400">{categoryLabel(work.category)}</span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-stone-900">書誌情報</h2>
                      <div className="text-sm leading-7 text-stone-500">
                        {work.pen_name} ・ {new Date(work.created_at).toLocaleDateString("ja-JP")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-stone-400">概要</h3>
                      <p className="leading-8 text-stone-700">
                        {work.summary || "この作品にはまだ概要が記されていません。本文を開いて、そのまま作品に入ってください。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="rounded-2xl">
                        <a href="#read">本文を読む</a>
                      </Button>
                      <Button asChild variant="outline" className="rounded-2xl">
                        <Link href="/works">書架へ戻る</Link>
                      </Button>
                    </div>
                  </div>

                  <div id="read" className="space-y-5">
                    <div className="border-b border-stone-200 pb-3">
                      <h3 className="text-xl font-semibold text-stone-900">本文</h3>
                    </div>
                    <div className="whitespace-pre-wrap text-[15px] leading-8 text-stone-800 md:text-base">
                      {work.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}