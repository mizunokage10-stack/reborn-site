

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

function recordCoverClass() {
  return "from-stone-100 via-stone-50 to-amber-50 border-stone-300";
}

export default async function RecordBookPage({
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
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-stone-900">記録本が見つかりません</h1>
              <p className="leading-8 text-stone-600">
                URL が正しくないか、この記録本はまだ作られていません。
              </p>
            </div>
          </CardContent>
        </Card>
      </RebornShell>
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
      <RebornShell>
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
      </RebornShell>
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
      <RebornShell>
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
                  <Link href="/records">記録の書架へ戻る</Link>
                </Button>
              </div>
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
            <div className="grid md:grid-cols-[380px_1fr]">
              <div className="bg-stone-50 p-5 md:p-8">
                <div
                  className={`relative mx-auto flex min-h-[420px] w-full max-w-[18rem] flex-col justify-between overflow-hidden rounded-r-[0.5rem] border bg-gradient-to-br ${recordCoverClass()} p-8 text-stone-900 shadow-sm`}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-y-0 left-0 w-4 bg-stone-900/5" />
                    <div className="absolute inset-y-0 left-[16px] w-px bg-stone-500/25" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_42%)]" />
                  </div>

                  <div className="relative z-10 flex items-start justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-stone-500">
                    <span>RECORD</span>
                    <span>{records.length}篇</span>
                  </div>

                  <div className="relative z-10 flex-1 py-10">
                    <div className="mx-auto flex h-full max-w-[15.5rem] flex-col items-center justify-start text-center">
                      <div className="mb-10 space-y-1 text-[10px] uppercase tracking-[0.3em] text-stone-500">
                        <div>{work.category}</div>
                        <div>読後記録</div>
                      </div>

                      <div className="space-y-3">
                        <h1 className="text-[2.2rem] font-semibold leading-[1.32] text-stone-900 md:text-[2.5rem]">
                          『{work.title}』の記録
                        </h1>
                        <div className="text-sm tracking-[0.18em] text-stone-600">
                          原作: {work.pen_name}
                        </div>
                      </div>

                      <div className="mt-8 w-16 border-t border-stone-400/60" />

                      <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-stone-500">
                        Reading Archive
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 text-center text-sm leading-6 text-stone-500">
                    <div>{new Date(work.created_at).toLocaleDateString("ja-JP")}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-10">
                <div className="mx-auto max-w-[680px] space-y-8">
                  <div className="space-y-4 border-b border-stone-200 pb-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-stone-900">記録本について</h2>
                      <p className="leading-8 text-stone-600">
                        ここに綴られているのは、読者たちがこの作品を読んだあとに残した公開記録です。感想や立ち止まった箇所、誰かと話したくなった気持ちなどが、一冊の本として静かにまとめられています。
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="rounded-2xl">
                        <Link href={`/works/${slug}/record`}>この本に記録を残す</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-2xl">
                        <Link href="/records">記録の書架へ戻る</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="border-b border-stone-200 pb-3">
                      <h3 className="text-xl font-semibold text-stone-900">綴られた記録</h3>
                    </div>

                    <div className="grid gap-4">
                      {records.map((record) => (
                        <div key={record.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-base font-semibold text-stone-900">
                              {record.is_anonymous ? "匿名" : record.display_name || "無名"}
                            </div>
                            <div className="text-sm text-stone-500">
                              {new Date(record.created_at).toLocaleDateString("ja-JP")}
                            </div>
                          </div>
                          <p className="whitespace-pre-wrap leading-8 text-stone-700">{record.body}</p>
                        </div>
                      ))}
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