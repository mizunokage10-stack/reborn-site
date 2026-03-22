import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent } from "@/components/ui/card";
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

function extractIdFromSlug(slug?: string) {
  if (!slug) return null;
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function paginateContent(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").trim();

  if (!normalized) return ["本文がありません。"];

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

  const pages: string[] = [];
  let pageBuffer: string[] = [];
  let pageLength = 0;

  for (const chunk of chunks) {
    const chunkLength = chunk.length;
    const nextLength = pageLength + chunkLength;

    if (pageBuffer.length > 0 && nextLength > 320) {
      pages.push(pageBuffer.join("\n\n"));
      pageBuffer = [chunk];
      pageLength = chunkLength;
    } else {
      pageBuffer.push(chunk);
      pageLength = nextLength;
    }
  }

  if (pageBuffer.length > 0) {
    pages.push(pageBuffer.join("\n\n"));
  }

  return pages.length > 0 ? pages : ["本文がありません。"];
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

  const pages = paginateContent(work.content);
  const currentPage = Math.min(
    Math.max(Number(resolvedSearchParams?.page ?? "1") || 1, 1),
    pages.length
  );
  const currentContent = pages[currentPage - 1];
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < pages.length ? currentPage + 1 : null;

  return (
    <RebornShell>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 md:text-3xl">{work.title}</h1>
            <div className="mt-1 text-sm text-stone-500">{work.pen_name}</div>
          </div>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={`/works/${slug}`}>表紙へ戻る</Link>
          </Button>
        </div>

        <Card className="rounded-[2rem] border-stone-200 shadow-sm">
          <CardContent className="p-6 md:p-10">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 text-sm text-stone-500">
                <span>第 {currentPage} 頁</span>
                <span>全 {pages.length} 頁</span>
              </div>

              <div
                className="min-h-[58vh] whitespace-pre-wrap text-stone-800"
                style={{
                  fontFamily: '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "Times New Roman", serif',
                  fontSize: "10.5pt",
                  lineHeight: "2.2",
                  letterSpacing: "0.01em",
                }}
              >
                {currentContent}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
                <div>
                  {prevPage ? (
                    <Button asChild variant="outline" className="rounded-2xl">
                      <Link href={`/works/${slug}/read?page=${prevPage}`}>前の頁</Link>
                    </Button>
                  ) : (
                    <Button disabled variant="outline" className="rounded-2xl">
                      前の頁
                    </Button>
                  )}
                </div>

                <div className="text-sm text-stone-400">{currentPage} / {pages.length}</div>

                <div>
                  {nextPage ? (
                    <Button asChild className="rounded-2xl">
                      <Link href={`/works/${slug}/read?page=${nextPage}`}>次の頁</Link>
                    </Button>
                  ) : (
                    <Button disabled className="rounded-2xl">
                      次の頁
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}
