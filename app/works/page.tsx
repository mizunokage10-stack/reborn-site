"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { categories } from "@/lib/sample-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <RebornShell>
      <div className="grid gap-4">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>作品一覧</CardTitle>
            <CardDescription>公開された作品をカテゴリやキーワードから探せます。</CardDescription>
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
            作品一覧を読み込み中です...
          </div>
        )}

        {!loading && !errorMessage && filtered.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            条件に合う公開作品はまだありません。
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((work) => (
            <Card key={work.id} className="rounded-3xl border-stone-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full">{work.category}</Badge>
                  <Badge className="rounded-full">公開済み</Badge>
                </div>
                <CardTitle className="leading-7">{work.title}</CardTitle>
                <CardDescription>
                  {work.pen_name} ・ {new Date(work.created_at).toLocaleDateString("ja-JP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-6 text-stone-700">
                  {work.summary || (work.content.length > 90 ? `${work.content.slice(0, 90)}…` : work.content)}
                </p>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link href={`/works/${slugify(work.title, work.id)}`}>読む</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RebornShell>
  );
}