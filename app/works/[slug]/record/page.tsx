import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default async function RecordPage({
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

  async function createRecord(formData: FormData) {
    "use server";

    const submissionId = Number(formData.get("submission_id"));
    const currentSlug = String(formData.get("slug") || "");
    const displayNameRaw = String(formData.get("display_name") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const isAnonymous = formData.get("is_anonymous") === "on";
    const isPublic = formData.get("is_public") === "on";

    if (!submissionId || !currentSlug) {
      redirect("/works?error=record");
    }

    if (!body) {
      redirect(`/works/${currentSlug}/record?error=body`);
    }

    const displayName = isAnonymous ? null : displayNameRaw || null;

    const { error } = await supabase.from("reading_records").insert({
      submission_id: submissionId,
      display_name: displayName,
      is_anonymous: isAnonymous,
      is_public: isPublic,
      body,
    });

    if (error) {
      redirect(`/works/${currentSlug}/record?error=save`);
    }

    revalidatePath(`/works/${currentSlug}`);
    revalidatePath(`/works/${currentSlug}/record`);
    redirect(`/works/${currentSlug}/record?saved=1`);
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
            <div className="text-sm tracking-[0.16em] text-stone-500">Reading Record</div>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 md:text-3xl">
              記録を残す
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
                  ここでは、読み終えたあとに残したい感想や記録を、この本に対応する記録本へ綴っていきます。
                  匿名で残すことも、他の読者にも公開することも選べます。
                </p>
              </div>

              {resolvedSearchParams?.saved === "1" && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                  記録を残しました。この本のそばに、新しい一冊が加わりました。
                </div>
              )}

              {resolvedSearchParams?.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {resolvedSearchParams.error === "body"
                    ? "記録本文を入力してください。"
                    : "記録の保存に失敗しました。時間をおいてもう一度お試しください。"}
                </div>
              )}

              <form action={createRecord} className="space-y-6">
                <input type="hidden" name="submission_id" value={work.id} />
                <input type="hidden" name="slug" value={slug} />

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-stone-700">名前</label>
                  <Input name="display_name" className="rounded-2xl" placeholder="表示する名前" />
                  <p className="text-xs leading-6 text-stone-500">
                    匿名を選んだ場合、ここに入力があっても表示はされません。
                  </p>
                </div>

                <div className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <label className="flex items-center gap-3 text-sm text-stone-700">
                    <input type="checkbox" name="is_anonymous" className="h-4 w-4 rounded border-stone-300" />
                    匿名で残す
                  </label>
                  <label className="flex items-center gap-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name="is_public"
                      defaultChecked
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    他の読者にも公開する
                  </label>
                  <p className="text-xs leading-6 text-stone-500">
                    公開を外した記録は、今後作者だけに届く形式として扱えるようにしていきます。
                  </p>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-stone-700">記録本文</label>
                  <Textarea
                    name="body"
                    className="min-h-[260px] rounded-2xl"
                    placeholder="この本を読んで感じたこと、立ち止まった箇所、誰かと話したくなったことなどを書いてください。"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" className="rounded-2xl">
                    記録を残す
                  </Button>
                  <Button asChild type="button" variant="outline" className="rounded-2xl">
                    <Link href={`/works/${slug}`}>いったん戻る</Link>
                  </Button>
                </div>
              </form>
              <p className="text-sm leading-7 text-stone-500">
                公開された記録は、このページの下に並ぶのではなく、書架の中に置かれる「記録の本」として読める形にしていきます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}