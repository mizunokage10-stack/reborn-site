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
    ink: "from-zinc-700 to-zinc-950",
    navy: "from-blue-800 to-slate-950",
    emerald: "from-emerald-700 to-emerald-950",
    burgundy: "from-rose-800 to-stone-950",
    amber: "from-amber-700 to-stone-950",
    violet: "from-violet-700 to-violet-950",
    grayblue: "from-slate-600 to-slate-900",
  };

  return gradients[color ?? "ink"] ?? gradients.ink;
}

function coverStyleClasses(style: string | null) {
  const styles: Record<string, string> = {
    minimal: "",
    classic: "before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-white/25 after:absolute after:inset-y-0 after:right-3 after:w-px after:bg-black/25",
    soft: "shadow-[0_8px_20px_rgba(0,0,0,0.18)]",
    heavy: "shadow-[0_12px_28px_rgba(0,0,0,0.32)] border-black/20",
    sharp: "ring-1 ring-inset ring-white/15",
  };

  return styles[style ?? "minimal"] ?? "";
}

function spineWidthClass(style: string | null) {
  if (style === "heavy") return "w-20 md:w-24";
  if (style === "soft") return "w-18 md:w-22";
  return "w-16 md:w-20";
}

function groupByCategory(works: PublishedWork[]) {
  const visibleCategories = categories.filter((item) => item !== "すべて");

  return visibleCategories
    .map((category) => ({
      category,
      items: works.filter((work) => work.category === category),
    }))
    .filter((group) => group.items.length > 0);
}

function groupNovelsByTypeAndShelf(works: PublishedWork[]) {
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

export default function WorksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [literaryType, setLiteraryType] = useState("all");
  const [shelfTag, setShelfTag] = useState("all");
  const [works, setWorks] = useState<PublishedWork[]>([]);
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

      setWorks(data ?? []);
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
      <div className="grid gap-4">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>書架</CardTitle>
            <CardDescription>
              寄せられた作品を、棚ごとにたどるための図書室です。背表紙を選ぶと、その本の詳細へ進めます。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-2xl pl-9"
                placeholder="タイトル・作者・概要・本文を検索"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
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

            {category === "小説" && (
              <div className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="grid gap-2">
                  <div className="text-sm font-medium text-stone-700">まず棚を選ぶ</div>
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
                  <div className="text-sm font-medium text-stone-700">その棚の中で類いを選ぶ</div>
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
            )}
          </CardContent>
        </Card>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            書架を読み込み中です...
          </div>
        )}

        {!loading && !errorMessage && filtered.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            条件に合う公開作品はまだありません。
          </div>
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
                            href={`/works/${slugify(work.title, work.id)}`}
                            className={`group relative flex h-72 ${spineWidthClass(work.cover_style)} shrink-0 flex-col justify-between rounded-t-xl rounded-b-md border border-black/10 bg-gradient-to-b ${coverColorGradient(
                              work.cover_color
                            )} ${coverStyleClasses(work.cover_style)} px-2 py-3 text-stone-100 transition hover:-translate-y-1 hover:shadow-xl md:h-80`}
                          >
                            <div className="relative z-10 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-stone-200/80 md:text-[11px]">
                              <span>Reborn</span>
                            </div>

                            <div className="relative z-10 flex-1 py-3">
                              <div className="writing-mode-vertical-rl mx-auto h-full text-center text-sm font-medium leading-6 tracking-[0.08em] text-stone-50 md:text-base">
                                {work.title}
                              </div>
                            </div>

                            <div className="relative z-10 border-t border-white/20 pt-2 text-[10px] leading-4 text-stone-200/85 md:text-xs">
                              <div className="line-clamp-2">{work.pen_name}</div>
                            </div>

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-md bg-black/15 opacity-80" />
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
                        href={`/works/${slugify(work.title, work.id)}`}
                        className={`group relative flex h-72 ${spineWidthClass(work.cover_style)} shrink-0 flex-col justify-between rounded-t-xl rounded-b-md border border-black/10 bg-gradient-to-b ${coverColorGradient(
                          work.cover_color
                        )} ${coverStyleClasses(work.cover_style)} px-2 py-3 text-stone-100 transition hover:-translate-y-1 hover:shadow-xl md:h-80`}
                      >
                        <div className="relative z-10 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-stone-200/80 md:text-[11px]">
                          <span>Reborn</span>
                        </div>

                        <div className="relative z-10 flex-1 py-3">
                          <div className="writing-mode-vertical-rl mx-auto h-full text-center text-sm font-medium leading-6 tracking-[0.08em] text-stone-50 md:text-base">
                            {work.title}
                          </div>
                        </div>

                        <div className="relative z-10 border-t border-white/20 pt-2 text-[10px] leading-4 text-stone-200/85 md:text-xs">
                          <div className="line-clamp-2">{work.pen_name}</div>
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-md bg-black/15 opacity-80" />
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