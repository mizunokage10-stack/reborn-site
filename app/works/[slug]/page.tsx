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
  literary_type: string | null;
  shelf_tag: string | null;
  cover_color: string | null;
  cover_style: string | null;
  summary: string | null;
  content: string;
  status: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function coverColorGradient(color: string | null) {
  const gradients: Record<string, string> = {
    ink: "from-zinc-700 via-zinc-800 to-zinc-950",
    navy: "from-blue-800 via-slate-800 to-slate-950",
    emerald: "from-emerald-700 via-emerald-800 to-emerald-950",
    burgundy: "from-rose-800 via-stone-800 to-stone-950",
    amber: "from-amber-700 via-orange-800 to-stone-950",
    violet: "from-violet-700 via-violet-800 to-violet-950",
    grayblue: "from-slate-600 via-slate-700 to-slate-900",
  };

  return gradients[color ?? "ink"] ?? gradients.ink;
}

function coverDecorationClass(style: string | null) {
  const styles: Record<string, string> = {
    minimal: "",
    classic:
      "before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-white/25 after:absolute after:inset-y-0 after:right-6 after:w-px after:bg-black/25",
    soft: "shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
    heavy: "shadow-[0_22px_48px_rgba(0,0,0,0.34)] ring-1 ring-inset ring-black/10",
    sharp: "ring-1 ring-inset ring-white/15",
  };

  return styles[style ?? "minimal"] ?? "";
}

function literaryTypeLabel(value: string | null) {
  if (value === "popular") return "大衆文学";
  return "純文学";
}

function shelfTagLabel(value: string | null) {
  const labels: Record<string, string> = {
    mystery: "推理",
    romance: "恋愛",
    dream: "夢",
    strange: "怪異",
    family: "家族",
    city: "都市",
    experimental: "実験",
    other: "その他",
  };

  return labels[value ?? "other"] ?? "その他";
}

function extractIdFromSlug(slug?: string) {
  if (!slug) return null;
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
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
  const slug = resolvedParams?.slug;
  const id = extractIdFromSlug(slug);

  if (!id || !slug) {
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
    .select(
      "id, title, pen_name, category, literary_type, shelf_tag, cover_color, cover_style, summary, content, status, created_at"
    )
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
              <Link
                href={`/works/${slug}/read`}
                className={`relative flex min-h-[420px] flex-col justify-between bg-gradient-to-b ${coverColorGradient(
                  work.cover_color
                )} ${coverDecorationClass(work.cover_style)} p-8 text-stone-100 transition hover:brightness-110`}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-6 top-0 h-full w-px bg-white/30" />
                  <div className="absolute right-6 top-0 h-full w-px bg-black/30" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
                </div>

                <div className="relative z-10 flex items-start justify-between gap-4 text-xs uppercase tracking-[0.25em] text-stone-200/80">
                  <span>Reborn</span>
                  <span>{literaryTypeLabel(work.literary_type)}</span>
                </div>

                <div className="relative z-10 space-y-6 py-10">
                  <div className="space-y-2 text-xs uppercase tracking-[0.25em] text-stone-200/80">
                    <div>{work.category}</div>
                    <div>{shelfTagLabel(work.shelf_tag)}</div>
                  </div>
                  <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                    {work.title}
                  </h1>
                </div>

                <div className="relative z-10 border-t border-white/20 pt-4 text-sm leading-6 text-stone-200/90">
                  <div>{work.pen_name}</div>
                  <div>{new Date(work.created_at).toLocaleDateString("ja-JP")}</div>
                </div>
              </Link>

              <div className="bg-white p-8 md:p-10">
                <div className="mx-auto max-w-2xl space-y-8">
                  <div className="space-y-4 border-b border-stone-200 pb-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="rounded-full">
                        {work.category}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {literaryTypeLabel(work.literary_type)}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {shelfTagLabel(work.shelf_tag)}
                      </Badge>
                      <span className="text-sm text-stone-400">{categoryLabel(work.category)}</span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-stone-900">書誌情報</h2>
                      <div className="text-sm leading-7 text-stone-500">
                        {work.pen_name} ・ {new Date(work.created_at).toLocaleDateString("ja-JP")}
                      </div>
                    </div>

                    <div className="grid gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 md:grid-cols-2">
                      <div>文学タイプ: {literaryTypeLabel(work.literary_type)}</div>
                      <div>棚タグ: {shelfTagLabel(work.shelf_tag)}</div>
                      <div>
                        背表紙の色: {
                          work.cover_color === "ink" ? "墨" :
                          work.cover_color === "navy" ? "紺碧" :
                          work.cover_color === "emerald" ? "深緑" :
                          work.cover_color === "burgundy" ? "臙脂" :
                          work.cover_color === "amber" ? "朽葉" :
                          work.cover_color === "violet" ? "紫紺" :
                          "灰青"
                        }
                      </div>
                      <div>
                        装丁スタイル: {
                          work.cover_style === "minimal" ? "静かな装丁" :
                          work.cover_style === "classic" ? "古典的な装丁" :
                          work.cover_style === "soft" ? "柔らかな装丁" :
                          work.cover_style === "heavy" ? "重たい装丁" :
                          "鋭い装丁"
                        }
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-stone-400">概要</h3>
                      <p className="leading-8 text-stone-700">
                        {work.summary || "この作品にはまだ概要が記されていません。表紙を開くか、下のボタンから読み始めてください。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="rounded-2xl">
                        <Link href={`/works/${slug}/read`}>本を読む</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-2xl">
                        <Link href="/works">書架へ戻る</Link>
                      </Button>
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