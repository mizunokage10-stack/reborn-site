

import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type RecordBook = {
  id: number;
  title: string;
  pen_name: string;
  category: string;
  created_at: string;
  record_count: number;
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

function recordCoverClass(index: number) {
  const styles = [
    "from-stone-100 via-stone-50 to-amber-50 border-stone-300",
    "from-slate-100 via-stone-50 to-blue-50 border-slate-300",
    "from-rose-50 via-stone-50 to-orange-50 border-rose-200",
    "from-emerald-50 via-stone-50 to-teal-50 border-emerald-200",
  ];

  return styles[index % styles.length];
}

export default async function RecordsPage() {
  const { data: worksData, error } = await supabase
    .from("submissions")
    .select("id, title, pen_name, category, created_at, status")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const works = worksData ?? [];

  const recordBooks: RecordBook[] = [];

  for (const work of works) {
    const { count } = await supabase
      .from("reading_records")
      .select("*", { count: "exact", head: true })
      .eq("submission_id", work.id)
      .eq("is_public", true);

    if ((count ?? 0) > 0) {
      recordBooks.push({
        id: work.id,
        title: work.title,
        pen_name: work.pen_name,
        category: work.category,
        created_at: work.created_at,
        record_count: count ?? 0,
      });
    }
  }

  return (
    <RebornShell>
      <div className="grid gap-6">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="space-y-2">
              <CardTitle>記録の書架</CardTitle>
              <CardDescription className="max-w-2xl leading-7 text-stone-600">
                読まれた作品に寄せられた記録は、作品のそばに残るもう一冊の本です。ここでは、公開された読後の記録が本ごとにまとめられています。
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-[2rem] border border-stone-200 bg-stone-100 p-4">
              <div className="mb-3 text-sm text-stone-500">記録が綴られた本</div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  記録の書架の読み込みに失敗しました: {error.message}
                </div>
              ) : recordBooks.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-7 text-stone-600">
                  まだ公開されている記録はありません。作品を読み終えたあとに最初の一冊を残してみませんか。
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {recordBooks.map((book, index) => (
                    <Link
                      key={book.id}
                      href={`/records/${slugify(book.title, book.id)}`}
                      className={`group relative flex min-h-[320px] w-full max-w-[16.5rem] shrink-0 flex-col justify-between overflow-hidden rounded-r-[0.5rem] border bg-gradient-to-br ${recordCoverClass(
                        index
                      )} p-6 text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                    >
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-y-0 left-0 w-4 bg-stone-900/5" />
                        <div className="absolute inset-y-0 left-[16px] w-px bg-stone-500/25" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_42%)]" />
                      </div>

                      <div className="relative z-10 flex items-start justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-stone-500">
                        <span>RECORD</span>
                        <span>{book.record_count}篇</span>
                      </div>

                      <div className="relative z-10 flex-1 py-8 text-center">
                        <div className="mx-auto flex h-full max-w-[13rem] flex-col items-center justify-start">
                          <div className="mb-8 space-y-1 text-[10px] uppercase tracking-[0.3em] text-stone-500">
                            <div>{book.category}</div>
                            <div>読後記録</div>
                          </div>

                          <div className="space-y-3">
                            <h2 className="text-[2rem] font-semibold leading-[1.32] text-stone-900">
                              『{book.title}』の記録
                            </h2>
                            <div className="text-sm tracking-[0.18em] text-stone-600">
                              原作: {book.pen_name}
                            </div>
                          </div>

                          <div className="mt-8 w-16 border-t border-stone-400/60" />

                          <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-stone-500">
                            Reading Archive
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 pt-4 text-center text-sm leading-6 text-stone-500">
                        <div>{new Date(book.created_at).toLocaleDateString("ja-JP")}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-2 h-3 rounded-full bg-stone-300/80 shadow-inner" />
            </div>
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}