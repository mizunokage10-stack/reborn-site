

"use client";

import { useMemo, useState } from "react";
import RebornShell from "@/components/reborn/shell";
import { categories, sampleWorks } from "@/lib/sample-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

export default function WorksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");

  const filtered = useMemo(() => {
    return sampleWorks.filter((work) => {
      const categoryMatch = category === "すべて" || work.category === category;
      const queryMatch =
        !query ||
        `${work.title} ${work.author} ${work.summary}`.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [query, category]);

  return (
    <RebornShell>
      <div className="grid gap-4">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>作品一覧</CardTitle>
            <CardDescription>カテゴリやキーワードから作品を探せます。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-2xl pl-9"
                placeholder="タイトル・作者・概要を検索"
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((work) => (
            <Card key={work.id} className="rounded-3xl border-stone-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full">{work.category}</Badge>
                  {work.featured && <Badge className="rounded-full">注目</Badge>}
                </div>
                <CardTitle className="leading-7">{work.title}</CardTitle>
                <CardDescription>{work.author} ・ {work.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-6 text-stone-700">{work.summary}</p>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link href={`/works/${work.slug}`}>読む</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RebornShell>
  );
}