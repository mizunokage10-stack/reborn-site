import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardContent className="p-8 md:p-10">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-3 border-b border-stone-200 pb-6">
              <Badge variant="secondary" className="rounded-full">
                {work.category}
              </Badge>
              <h1 className="text-3xl font-semibold leading-tight">{work.title}</h1>
              <div className="text-sm text-stone-500">
                {work.pen_name} ・ {new Date(work.created_at).toLocaleDateString("ja-JP")}
              </div>
              {work.summary && (
                <p className="leading-7 text-stone-600">{work.summary}</p>
              )}
            </div>

            <div className="whitespace-pre-wrap text-[15px] leading-8 text-stone-800 md:text-base">
              {work.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </RebornShell>
  );
}