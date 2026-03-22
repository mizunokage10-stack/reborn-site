"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { categories } from "@/lib/sample-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

type ShelfItem = {
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
  href: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const literaryTypes = [
  { value: "all", label: "すべて" },
  { value: "pure", label: "純文学" },
  { value: "popular", label: "大衆文学" },
];

const shelfTags = [
  { value: "all", label: "すべて" },
  { value: "mystery", label: "推理" },
  { value: "romance", label: "恋愛" },
  { value: "dream", label: "夢" },
  { value: "strange", label: "怪異" },
  { value: "family", label: "家族" },
  { value: "city", label: "都市" },
  { value: "experimental", label: "実験" },
  { value: "other", label: "その他" },
];

const shelfCategories = categories.includes("記録") ? categories : [...categories, "記録"];

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

function categoryShelfLabel(category: string) {
  const labels: Record<string, string> = {
    小説: "物語の棚",
    日記: "日々の棚",
    文芸批評: "批評の棚",
    俳句: "短詩の棚",
    絵: "図像の棚",
    記録: "読後記録の棚",
  };

  return labels[category] ?? "寄せられた棚";
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

function coverColorGradient(color: string | null) {
  const gradients: Record<string, string> = {
    ink: "from-zinc-800 via-zinc-700 to-black",
    navy: "from-slate-900 via-blue-900 to-slate-800",
    emerald: "from-emerald-950 via-emerald-800 to-teal-900",
    burgundy: "from-stone-950 via-rose-900 to-stone-800",
    amber: "from-stone-900 via-amber-800 to-orange-950",
    violet: "from-slate-950 via-violet-900 to-purple-950",
    grayblue: "from-slate-800 via-slate-700 to-slate-900",
  };

  return gradients[color ?? "ink"] ?? gradients.ink;
}

function coverStyleClasses(style: string | null) {
  const styles: Record<string, string> = {
    minimal:
      "before:absolute before:inset-y-0 before:left-[10px] before:w-px before:bg-white/10 after:absolute after:inset-y-0 after:right-[8px] after:w-px after:bg-black/25",
    classic:
      "before:absolute before:inset-y-3 before:left-[10px] before:w-px before:bg-white/25 after:absolute after:inset-y-3 after:right-[8px] after:w-px after:bg-black/30 ring-1 ring-inset ring-amber-100/10",
    soft:
      "before:absolute before:inset-y-0 before:left-[10px] before:w-px before:bg-white/15 after:absolute after:inset-y-0 after:right-[8px] after:w-px after:bg-black/20 shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
    heavy:
      "before:absolute before:inset-y-0 before:left-[10px] before:w-px before:bg-white/18 after:absolute after:inset-y-0 after:right-[8px] after:w-px after:bg-black/30 shadow-[0_14px_30px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-black/15",
    sharp:
      "before:absolute before:inset-y-0 before:left-[10px] before:w-px before:bg-white/20 after:absolute after:inset-y-0 after:right-[8px] after:w-px after:bg-black/35 ring-1 ring-inset ring-white/15 shadow-[0_10px_20px_rgba(0,0,0,0.22)]",
  };

  return styles[style ?? "minimal"] ?? styles.minimal;
}

function spineWidthClass(style: string | null) {
  if (style === "heavy") return "w-20 md:w-24";
  if (style === "soft") return "w-[4.5rem] md:w-[5.5rem]";
  return "w-16 md:w-20";
}

function groupByCategory(works: ShelfItem[]) {
  const visibleCategories = shelfCategories.filter((item) => item !== "すべて");

  return visibleCategories
    .map((category) => ({
      category,
      items: works.filter((work) => work.category === category),
    }))
    .filter((group) => group.items.length > 0);
}


function groupNovelsByTypeAndShelf(works: ShelfItem[]) {
  const typeOrder = ["pure", "popular"];

  return typeOrder
    .map((type) => {
      const typeItems = works.filter((work) => (work.literary_type ?? "pure") === type);
      const shelfGroups = shelfTags
        .filter((tag) => tag.value !== "all")
        .map((tag) => ({
          shelf: tag.value,
          label: tag.label,
          items: typeItems.filter((work) => (work.shelf_tag ?? "other") === tag.value),
        }))
        .filter((group) => group.items.length > 0);

      return {
        type,
        label: literaryTypeLabel(type),
        items: typeItems,
        shelves: shelfGroups,
      };
    })
    .filter((group) => group.items.length > 0);
}

function BookshelfSkeleton({ title = "書架を整えています" }: { title?: string }) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded bg-stone-200/80" />
          <div className="h-4 w-52 rounded bg-stone-100" />
        </div>
        <div className="h-4 w-12 rounded bg-stone-100" />
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-stone-100 p-4">
        <div className="mb-3 text-sm text-stone-500">{title}</div>
        <div className="flex gap-3 overflow-hidden pb-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`h-72 shrink-0 rounded-t-xl rounded-b-md bg-stone-300/70 md:h-80 ${
                index % 3 === 0 ? "w-20 md:w-24" : index % 2 === 0 ? "w-[4.5rem] md:w-[5.5rem]" : "w-16 md:w-20"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 h-3 rounded-full bg-stone-300/80 shadow-inner" />
      </div>
    </section>
  );
}

export default function WorksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [literaryType, setLiteraryType] = useState("all");
  const [shelfTag, setShelfTag] = useState("all");
  const [works, setWorks] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchWorks() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, title, pen_name, category, literary_type, shelf_tag, cover_color, cover_style, summary, content, status, created_at"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(`作品一覧の読み込みに失敗しました: ${error.message}`);
        setWorks([]);
        setLoading(false);
        return;
      }

      const publishedWorks = (data ?? []).map((work) => ({
        ...work,
        href: `/works/${slugify(work.title, work.id)}`,
      }));

      const { data: recordsData, error: recordsError } = await supabase
        .from("reading_records")
        .select("submission_id")
        .eq("is_public", true);

      if (recordsError) {
        setErrorMessage(`記録の読み込みに失敗しました: ${recordsError.message}`);
        setWorks(publishedWorks);
        setLoading(false);
        return;
      }

      const recordCountMap = new Map<number, number>();
      (recordsData ?? []).forEach((record) => {
        const submissionId = Number(record.submission_id);
        recordCountMap.set(submissionId, (recordCountMap.get(submissionId) ?? 0) + 1);
      });

      const recordBooks = publishedWorks
        .filter((work) => (recordCountMap.get(work.id) ?? 0) > 0)
        .map((work) => ({
          ...work,
          title: `『${work.title}』の記録`,
          category: "記録",
          literary_type: null,
          shelf_tag: null,
          summary: `この作品には公開された記録が ${recordCountMap.get(work.id) ?? 0} 篇あります。`,
          content: `この作品には公開された記録が ${recordCountMap.get(work.id) ?? 0} 篇あります。`,
          href: `/records/${slugify(work.title, work.id)}`,
        }));

      setWorks([...publishedWorks, ...recordBooks]);
      setLoading(false);
    }

    fetchWorks();
  }, []);

  useEffect(() => {
    if (category !== "小説") {
      setLiteraryType("all");
      setShelfTag("all");
    }
  }, [category]);

  const filtered = useMemo(() => {
    return works.filter((work) => {
      const categoryMatch = category === "すべて" || work.category === category;
      const queryMatch =
        !query ||
        `${work.title} ${work.pen_name} ${work.summary ?? ""} ${work.content}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const literaryTypeMatch =
        category !== "小説" || literaryType === "all" || (work.literary_type ?? "pure") === literaryType;
      const shelfTagMatch =
        category !== "小説" || shelfTag === "all" || (work.shelf_tag ?? "other") === shelfTag;

      return categoryMatch && queryMatch && literaryTypeMatch && shelfTagMatch;
    });
  }, [works, query, category, literaryType, shelfTag]);

  const groupedWorks = useMemo(() => groupByCategory(filtered), [filtered]);
  const groupedNovels = useMemo(() => groupNovelsByTypeAndShelf(filtered.filter((work) => work.category === "小説")), [filtered]);

  return (
    <RebornShell>
      <div className="grid gap-6">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="space-y-2">
              <CardTitle>書架</CardTitle>
              <CardDescription className="max-w-2xl leading-7 text-stone-600">
                寄せられた作品を、棚ごとにたどるための図書室です。背表紙を選ぶと、その本の詳細へ進めます。
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <div className="text-sm font-medium text-stone-700">作品を探す</div>
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="rounded-2xl border-stone-200 bg-stone-50 pl-9"
                  placeholder="タイトル・作者・概要・本文を検索"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium text-stone-700">棚の種類を選ぶ</div>
              <div className="flex flex-wrap gap-2">
                {shelfCategories.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={category === item ? "default" : "outline"}
                    className="rounded-2xl"
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            {category === "小説" && (
              <div className="grid gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-stone-700">小説の棚をたどる</div>
                  <p className="text-sm leading-7 text-stone-500">
                    まず純文学か大衆文学を選び、そのあと棚の類いを絞ることができます。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="text-sm font-medium text-stone-700">1. 棚を選ぶ</div>
                    <div className="flex flex-wrap gap-2">
                      {literaryTypes.map((item) => (
                        <Button
                          key={item.value}
                          type="button"
                          variant={literaryType === item.value ? "default" : "outline"}
                          className="rounded-2xl"
                          onClick={() => setLiteraryType(item.value)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-sm font-medium text-stone-700">2. 類いを選ぶ</div>
                    <div className="flex flex-wrap gap-2">
                      {shelfTags.map((item) => (
                        <Button
                          key={item.value}
                          type="button"
                          variant={shelfTag === item.value ? "default" : "outline"}
                          className="rounded-2xl"
                          onClick={() => setShelfTag(item.value)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div className="grid gap-6">
            <BookshelfSkeleton />
            <BookshelfSkeleton title="作品を並べています" />
          </div>
        )}

        {!loading && !errorMessage && filtered.length === 0 && (
          <Card className="rounded-3xl border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-10">
              <div className="mx-auto max-w-2xl space-y-4 text-center">
                <h2 className="text-2xl font-semibold text-stone-900">まだ作品がありません</h2>
                <p className="leading-8 text-stone-600">
                  この条件に当てはまる作品はまだ書架に並んでいません。最初の一作を寄せてみませんか。
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button asChild className="rounded-2xl">
                    <Link href="/submit">作品を寄せる</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href="/works">条件をリセットする</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {category === "小説" ? (
          <div className="grid gap-6">
            {groupedNovels.map((typeGroup) => (
              <section key={typeGroup.type} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-stone-900">{typeGroup.label}</h2>
                    <p className="text-sm text-stone-500">小説の棚の中にある {typeGroup.label} の書架です。</p>
                  </div>
                  <div className="text-sm text-stone-400">{typeGroup.items.length}冊</div>
                </div>

                <div className="grid gap-5">
                  {typeGroup.shelves.map((shelfGroup) => (
                    <div key={`${typeGroup.type}-${shelfGroup.shelf}`} className="rounded-[2rem] border border-stone-200 bg-stone-100 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-900">{shelfGroup.label}</h3>
                          <p className="text-sm text-stone-500">この棚に収められた作品</p>
                        </div>
                        <div className="text-sm text-stone-400">{shelfGroup.items.length}冊</div>
                      </div>

                      <div className="flex gap-3 overflow-x-auto pb-3">
                        {shelfGroup.items.map((work) => (
                          <Link
                            key={work.id}
                            href={work.href}
                            className={`group relative flex h-72 ${spineWidthClass(work.cover_style)} shrink-0 flex-col justify-between overflow-hidden rounded-t-xl rounded-b-md border border-black/15 bg-gradient-to-b ${coverColorGradient(
                              work.cover_color
                            )} ${coverStyleClasses(work.cover_style)} px-3 py-3 text-stone-100 transition hover:-translate-y-1 hover:shadow-xl md:h-80`}
                          >
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-white/6" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-black/18" />
                            <div className="pointer-events-none absolute inset-x-3 top-5 h-px bg-white/18" />
                            <div className="pointer-events-none absolute inset-x-3 bottom-12 h-px bg-white/14" />
                            <div className="pointer-events-none absolute inset-x-3 bottom-4 h-[3px] rounded-full bg-black/20" />

                            <div className="relative z-10 flex items-center justify-center text-[10px] uppercase tracking-[0.28em] text-stone-200/80 md:text-[11px]">
                              <span>REBORN</span>
                            </div>

                            <div className="relative z-10 flex-1 py-4">
                              <div className="mx-auto h-full w-full rounded-full border border-white/10 bg-black/10 px-1 py-3">
                                <div className="writing-mode-vertical-rl mx-auto h-full text-center text-[15px] font-medium leading-6 tracking-[0.08em] text-stone-50 md:text-[17px]">
                                  {work.title}
                                </div>
                              </div>
                            </div>

                            <div className="relative z-10 border-t border-white/20 pt-2 text-[10px] leading-4 text-stone-200/85 md:text-xs">
                              <div className="line-clamp-2 text-center">{work.pen_name}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-stone-300/80 shadow-inner" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {groupedWorks.map((group) => (
              <section key={group.category} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-stone-900">{group.category}</h2>
                    <p className="text-sm text-stone-500">{categoryShelfLabel(group.category)}</p>
                  </div>
                  <div className="text-sm text-stone-400">{group.items.length}冊</div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-stone-100 p-4">
                  <div className="flex gap-3 overflow-x-auto pb-3">
                    {group.items.map((work) => (
                      <Link
                        key={work.id}
                        href={work.href}
                        className={`group relative flex h-72 ${spineWidthClass(work.cover_style)} shrink-0 flex-col justify-between overflow-hidden rounded-t-xl rounded-b-md border border-black/15 bg-gradient-to-b ${coverColorGradient(
                          work.cover_color
                        )} ${coverStyleClasses(work.cover_style)} px-3 py-3 text-stone-100 transition hover:-translate-y-1 hover:shadow-xl md:h-80`}
                      >
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-white/6" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-black/18" />
                        <div className="pointer-events-none absolute inset-x-3 top-5 h-px bg-white/18" />
                        <div className="pointer-events-none absolute inset-x-3 bottom-12 h-px bg-white/14" />
                        <div className="pointer-events-none absolute inset-x-3 bottom-4 h-[3px] rounded-full bg-black/20" />

                        <div className="relative z-10 flex items-center justify-center text-[10px] uppercase tracking-[0.28em] text-stone-200/80 md:text-[11px]">
                          <span>REBORN</span>
                        </div>

                        <div className="relative z-10 flex-1 py-4">
                          <div className="mx-auto h-full w-full rounded-full border border-white/10 bg-black/10 px-1 py-3">
                            <div className="writing-mode-vertical-rl mx-auto h-full text-center text-[15px] font-medium leading-6 tracking-[0.08em] text-stone-50 md:text-[17px]">
                              {work.title}
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 border-t border-white/20 pt-2 text-[10px] leading-4 text-stone-200/85 md:text-xs">
                          <div className="line-clamp-2 text-center">{work.pen_name}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-stone-300/80 shadow-inner" />
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </RebornShell>
  );
}