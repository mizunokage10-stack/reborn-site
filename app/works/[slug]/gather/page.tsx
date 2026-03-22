

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type PublishedWork = {
  id: number;
  title: string;
  pen_name: string;
  category: string;
  status: string | null;
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function GatherPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const id = extractIdFromSlug(slug);

  async function createGatherRequest(formData: FormData) {
    "use server";

    const submissionId = Number(formData.get("submission_id"));
    const currentSlug = String(formData.get("slug") || "");
    const email = String(formData.get("email") || "").trim();
    const notifyByEmail = formData.get("notify_by_email") === "on";

    if (!submissionId || !currentSlug) {
      redirect("/works?error=gather");
    }

    if (!email || !isValidEmail(email)) {
      redirect(`/works/${currentSlug}/gather?error=email`);
    }

    const { error } = await supabase.from("gather_requests").insert({
      submission_id: submissionId,
      email,
      notify_by_email: notifyByEmail,
    });

    if (error) {
      const duplicate = error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique");
      redirect(`/works/${currentSlug}/gather?error=${duplicate ? "duplicate" : "save"}`);
    }

    revalidatePath(`/works/${currentSlug}`);
    revalidatePath(`/works/${currentSlug}/gather`);
    redirect(`/works/${currentSlug}/gather?saved=1`);
  }

  if (!id || !slug) {
    return (
      <main className="min-h-screen bg-[#faf9f7] px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <Card className="rounded-3xl border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-stone-900">作品が見つかりません</h1>
                <p className="leading-8 text-stone-600">
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
    .select("id, title, pen_name, category, status")
    .eq("id", id)
    .eq("status", "published")
    .single();

  const work: PublishedWork | null = data ?? null;

  if (error || !work) {
    return (
      <main className="min-h-screen bg-[#faf9f7] px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <Card className="rounded-3xl border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-stone-900">作品が見つかりません</h1>
                <p className="leading-8 text-stone-600">
                  この作品は存在しないか、まだ公開されていません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { count } = await supabase
    .from("gather_requests")
    .select("*", { count: "exact", head: true })
    .eq("submission_id", id);

  return (
    <main
      className="min-h-screen bg-[#faf9f7] px-4 py-6 text-stone-900 md:px-6 md:py-8"
      style={{
        fontFamily:
          '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "Times New Roman", serif',
      }}
    >
      <div className="mx-auto grid w-full max-w-3xl gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm tracking-[0.16em] text-stone-500">Gather Around a Book</div>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 md:text-3xl">
              この本について集いたい
            </h1>
          </div>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={`/works/${slug}`}>本へ戻る</Link>
          </Button>
        </div>

        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardContent className="p-8 md:p-10">
            <div className="space-y-8">
              <div className="space-y-3 border-b border-stone-200 pb-6">
                <div className="text-sm tracking-[0.16em] text-stone-500">対象の本</div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-stone-900">{work.title}</h2>
                  <p className="text-sm leading-7 text-stone-500">
                    {work.pen_name} ・ {work.category}
                  </p>
                </div>
                <p className="leading-8 text-stone-600">
                  この本を他の読者と話したい、読書会があれば参加したい、そう思ったときに意思を残すためのページです。
                  一定数集まった本について、運営が読書会や対話の場を検討できるようにしていきます。
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <div className="text-sm tracking-[0.16em] text-stone-500">現在の集まりたい人数</div>
                <div className="mt-2 text-3xl font-semibold text-stone-900">{count ?? 0} 人</div>
              </div>

              {resolvedSearchParams?.saved === "1" && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                  この本について集いたいという意思を残しました。集いが企画されるときのために、記録しておきます。
                </div>
              )}

              {resolvedSearchParams?.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {resolvedSearchParams.error === "email"
                    ? "有効なメールアドレスを入力してください。"
                    : resolvedSearchParams.error === "duplicate"
                      ? "このメールアドレスでは、すでにこの本について集いたい意思が登録されています。"
                      : "保存に失敗しました。時間をおいてもう一度お試しください。"}
                </div>
              )}

              <form action={createGatherRequest} className="space-y-6">
                <input type="hidden" name="submission_id" value={work.id} />
                <input type="hidden" name="slug" value={slug} />

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-stone-700">メールアドレス</label>
                  <Input
                    name="email"
                    type="email"
                    className="rounded-2xl"
                    placeholder="読書会の通知を受け取りたいメールアドレス"
                  />
                  <p className="text-xs leading-6 text-stone-500">
                    同じメールアドレスでは、この本に対して一度だけ意思を残せます。
                  </p>
                </div>

                <div className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <label className="flex items-center gap-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name="notify_by_email"
                      defaultChecked
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    読書会や対話の場が企画されたらメールで知らせてほしい
                  </label>
                  <p className="text-xs leading-6 text-stone-500">
                    基本の案内はサイト上でも行う想定ですが、希望者にはメールでも通知できるようにします。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" className="rounded-2xl">
                    集いたい意思を残す
                  </Button>
                  <Button asChild type="button" variant="outline" className="rounded-2xl">
                    <Link href={`/works/${slug}`}>いったん戻る</Link>
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}