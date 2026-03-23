

import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookReader from "@/components/BookReader";
import Link from "next/link";

type PublishedWork = {
  id: number;
  title: string;
  pen_name: string;
  category: string;
  created_at: string;
  status: string | null;
};

type ReadingRecord = {
  id: number;
  display_name: string | null;
  is_anonymous: boolean | null;
  is_public: boolean | null;
  body: string;
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

function paginateRecordBodies(records: ReadingRecord[]) {
  const pages: {
    recordId: number;
    author: string;
    createdAt: string;
    content: string;
    pageInRecord: number;
    totalPagesInRecord: number;
  }[] = [];

  for (const record of records) {
    const author = record.is_anonymous ? "匿名" : record.display_name || "無名";
    const normalized = record.body.replace(/\r\n/g, "\n").trim();

    if (!normalized) {
      pages.push({
        recordId: record.id,
        author,
        createdAt: record.created_at,
        content: "",
        pageInRecord: 1,
        totalPagesInRecord: 1,
      });
      continue;
    }

    const rawParagraphs = normalized
      .split(/\n\s*\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    const chunks: string[] = [];

    for (const paragraph of rawParagraphs) {
      if (paragraph.length <= 220) {
        chunks.push(paragraph);
        continue;
      }

      const sentences = paragraph.match(/[^。！？!?]+[。！？!?]?/g) ?? [paragraph];
      let buffer = "";

      for (const sentence of sentences) {
        const next = `${buffer}${sentence}`;

        if (buffer && next.length > 220) {
          chunks.push(buffer.trim());
          buffer = sentence;
        } else {
          buffer = next;
        }
      }

      if (buffer.trim()) {
        chunks.push(buffer.trim());
      }
    }

    const recordPages: string[] = [];
    let pageBuffer: string[] = [];
    let pageLength = 0;

    for (const chunk of chunks) {
      const chunkLength = chunk.length;
      const nextLength = pageLength + chunkLength;

      if (pageBuffer.length > 0 && nextLength > 385) {
        recordPages.push(pageBuffer.join("\n\n"));
        pageBuffer = [chunk];
        pageLength = chunkLength;
      } else {
        pageBuffer.push(chunk);
        pageLength = nextLength;
      }
    }

    if (pageBuffer.length > 0) {
      recordPages.push(pageBuffer.join("\n\n"));
    }

    const totalPagesInRecord = recordPages.length || 1;

    (recordPages.length ? recordPages : [""]).forEach((content, index) => {
      pages.push({
        recordId: record.id,
        author,
        createdAt: record.created_at,
        content,
        pageInRecord: index + 1,
        totalPagesInRecord,
      });
    });
  }

  return pages;
}

export default async function RecordBookReadPage({
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
      <main className="min-h-screen bg-[#faf9f7] px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="rounded-3xl border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-stone-900">記録本が見つかりません</h1>
                <p className="leading-8 text-stone-600">
                  URL が正しくないか、この記録本はまだ作られていません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: workData, error: workError } = await supabase
    .from("submissions")
    .select("id, title, pen_name, category, created_at, status")
    .eq("id", id)
    .eq("status", "published")
    .single();

  const work: PublishedWork | null = workData ?? null;

  if (workError || !work) {
    return (
      <main className="min-h-screen bg-[#faf9f7] px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="rounded-3xl border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-stone-900">記録本が見つかりません</h1>
                <p className="leading-8 text-stone-600">
                  元になった作品が存在しないか、まだ公開されていません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: recordsData } = await supabase
    .from("reading_records")
    .select("id, display_name, is_anonymous, is_public, body, created_at")
    .eq("submission_id", id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const records: ReadingRecord[] = recordsData ?? [];

  if (records.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf9f7] px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="rounded-3xl border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-stone-900">記録本はまだ綴られていません</h1>
                <p className="leading-8 text-stone-600">
                  この作品に公開されている記録はまだありません。最初の一冊を残してみませんか。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-2xl">
                    <Link href={`/works/${slug}/record`}>記録を残す</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href="/works">書架へ戻る</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const pages = paginateRecordBodies(records);
  const currentPage = Math.min(
    Math.max(Number(resolvedSearchParams?.page ?? "1") || 1, 1),
    pages.length
  );
  const current = pages[currentPage - 1];

  return (
    <main
      className="min-h-screen bg-[#faf9f7] px-4 py-6 text-stone-900 md:px-6 md:py-8"
      style={{
        fontFamily:
          '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "Times New Roman", serif',
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm tracking-[0.16em] text-stone-500">Reading Archive</div>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 md:text-3xl">
              『{work.title}』の記録
            </h1>
          </div>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={`/records/${slug}`}>本を閉じる</Link>
          </Button>
        </div>

        <Card className="rounded-[2rem] border-stone-200 shadow-sm">
          <CardContent className="p-6 md:p-10">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 text-sm text-stone-500">
                <span>第 {currentPage} 頁</span>
                <span>全 {pages.length} 頁</span>
              </div>

              <div className="space-y-3 border-b border-stone-200 pb-5 text-sm text-stone-500">
                <div>記録者: {current.author}</div>
                <div>
                  記録内ページ: {current.pageInRecord} / {current.totalPagesInRecord}
                </div>
                <div>{new Date(current.createdAt).toLocaleDateString("ja-JP")}</div>
              </div>

              <BookReader
                pages={pages.map((page) => page.content)}
                currentPage={currentPage}
                basePath={`/records/${slug}/read`}
                pageInfoLabel="Leaf"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
