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

function spineStyle(category: string, index: number) {
  const presets = {
    小説: ["from-slate-700 to-slate-900", "from-zinc-700 to-zinc-900", "from-stone-700 to-stone-900"],
    日記: ["from-amber-700 to-orange-900", "from-rose-700 to-rose-900", "from-neutral-700 to-neutral-900"],
    文芸批評: ["from-emerald-700 to-emerald-950", "from-teal-700 to-slate-900", "from-cyan-700 to-cyan-950"],
    俳句: ["from-indigo-700 to-indigo-950", "from-violet-700 to-violet-950", "from-blue-700 to-slate-900"],
    絵: ["from-fuchsia-700 to-purple-950", "from-pink-700 to-rose-950", "from-purple-700 to-slate-950"],
  } as const;

  const fallback = ["from-stone-700 to-stone-900", "from-zinc-700 to-zinc-900", "from-neutral-700 to-neutral-900"];
  const palette = presets[category as keyof typeof presets] ?? fallback;
  return palette[index % palette.length];
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

function groupByCategory(works: PublishedWork[]) {
  const visibleCategories = categories.filter((item) => item !== "すべて");

  return visibleCategories
    .map((category) => ({
      category,
      items: works.filter((work) => work.category === category),
    }))
    .filter((group) => group.items.length > 0);
}

export default function WorksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [works, setWorks] = useState<PublishedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchWorks() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("submissions")
        .select("id, title, pen_name, category, summary, content, status, created_at")
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

  const filtered = useMemo(() => {
    return works.filter((work) => {
      const categoryMatch = category === "すべて" || work.category === category;
      const queryMatch =
        !query ||
        `${work.title} ${work.pen_name} ${work.summary ?? ""} ${work.content}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [works, query, category]);

  const groupedWorks = useMemo(() => groupByCategory(filtered), [filtered]);

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

        {!loading && !errorMessage && groupedWorks.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            条件に合う公開作品はまだありません。
          </div>
        )}

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
                  {group.items.map((work, index) => (
                    <Link
                      key={work.id}
                      href={`/works/${slugify(work.title, work.id)}`}
                      className={`group relative flex h-72 w-16 shrink-0 flex-col justify-between rounded-t-xl rounded-b-md border border-black/10 bg-gradient-to-b ${spineStyle(
                        group.category,
                        index
                      )} px-2 py-3 text-stone-100 shadow-md transition hover:-translate-y-1 hover:shadow-xl md:h-80 md:w-20`}
                    >
                      <div className="absolute inset-y-0 left-2 w-px bg-white/20" />
                      <div className="absolute inset-y-0 right-2 w-px bg-black/20" />

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
                      <div className="pointer-events-none absolute inset-0 rounded-t-xl rounded-b-md ring-1 ring-inset ring-white/10" />
                    </Link>
                  ))}
                </div>
                <div className="mt-2 h-3 rounded-full bg-stone-300/80 shadow-inner" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </RebornShell>
  );
}