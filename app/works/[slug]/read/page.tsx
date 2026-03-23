import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookReader from "@/components/BookReader";
import { paginateVerticalJapaneseText } from "@/lib/reader-pagination";
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

function extractIdFromSlug(slug?: string) {
  if (!slug) return null;
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

export default async function WorkReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const id = extractIdFromSlug(slug);

  if (!id || !slug) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
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
        </div>
      </main>
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
      <main className="min-h-screen bg-stone-50 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
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
        </div>
      </main>
    );
  }

  const pages = paginateVerticalJapaneseText(work.content);
  const currentPage = Math.min(
    Math.max(Number(resolvedSearchParams?.page ?? "1") || 1, 1),
    pages.length
  );

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 md:text-3xl">{work.title}</h1>
            <div className="mt-1 text-sm text-stone-500">{work.pen_name}</div>
          </div>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={`/works/${slug}`}>本を閉じる</Link>
          </Button>
        </div>

        <Card className="rounded-[2rem] border-stone-200 shadow-sm">
          <CardContent className="p-6 md:p-10">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 text-sm text-stone-500">
                <span>第 {currentPage} 頁</span>
                <span>全 {pages.length} 頁</span>
              </div>

              <BookReader
                pages={pages}
                currentPage={currentPage}
                basePath={`/works/${slug}/read`}
                pageInfoLabel="頁"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
