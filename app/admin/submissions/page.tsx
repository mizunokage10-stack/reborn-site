import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Submission = {
  id: number;
  pen_name: string;
  email: string;
  title: string;
  category: string;
  literary_type: string | null;
  shelf_tag: string | null;
  cover_color: string | null;
  cover_style: string | null;
  summary: string | null;
  content: string;
  external_url: string | null;
  allow_read_aloud: boolean;
  allow_sns_promo: boolean;
  status: string | null;
  created_at: string;
};

type ReadingRecord = {
  id: number;
  submission_id: number;
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

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  async function markAsPending(formData: FormData) {
    "use server";

    const id = Number(formData.get("id"));

    const { error } = await supabase
      .from("submissions")
      .update({ status: "pending" })
      .eq("id", id);

    if (error) {
      throw new Error(`保留への更新に失敗しました: ${error.message}`);
    }

    revalidatePath("/admin/submissions");
  }

  async function markAsPublished(formData: FormData) {
    "use server";

    const id = Number(formData.get("id"));

    const { error } = await supabase
      .from("submissions")
      .update({ status: "published" })
      .eq("id", id);

    if (error) {
      throw new Error(`公開への更新に失敗しました: ${error.message}`);
    }

    revalidatePath("/admin/submissions");
  }

  async function markAsRejected(formData: FormData) {
    "use server";

    const id = Number(formData.get("id"));

    const { error } = await supabase
      .from("submissions")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      throw new Error(`却下への更新に失敗しました: ${error.message}`);
    }

    revalidatePath("/admin/submissions");
  }

  async function deleteSubmission(formData: FormData) {
    "use server";

    const id = Number(formData.get("id"));

    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`削除に失敗しました: ${error.message}`);
    }

    revalidatePath("/admin/submissions");
    revalidatePath("/");
    revalidatePath("/works");
  }

  async function deleteReadingRecord(formData: FormData) {
    "use server";

    const id = Number(formData.get("id"));

    const { error } = await supabase
      .from("reading_records")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`記録の削除に失敗しました: ${error.message}`);
    }

    revalidatePath("/admin/submissions");
    revalidatePath("/works");
    revalidatePath("/records");
  }

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams?.status ?? "all";

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const submissions: Submission[] = data ?? [];

  const { data: recordsData, error: recordsError } = await supabase
    .from("reading_records")
    .select("id, submission_id, display_name, is_anonymous, is_public, body, created_at")
    .order("created_at", { ascending: false });

  const readingRecords: ReadingRecord[] = recordsData ?? [];
  const submissionMap = new Map(submissions.map((item) => [item.id, item]));

  const unreviewedCount = submissions.filter((item) => item.status === "submitted").length;
  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const publishedCount = submissions.filter((item) => item.status === "published").length;
  const rejectedCount = submissions.filter((item) => item.status === "rejected").length;
  const readingRecordCount = readingRecords.length;

  const filteredSubmissions = submissions.filter((item) => {
    if (statusFilter === "all") return true;
    return (item.status ?? "submitted") === statusFilter;
  });

  return (
    <RebornShell>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "未確認", value: String(unreviewedCount) },
            { label: "保留", value: String(pendingCount) },
            { label: "公開済み", value: String(publishedCount) },
            { label: "却下", value: String(rejectedCount) },
            { label: "記録", value: String(readingRecordCount) },
          ].map((item) => (
            <Card key={item.label} className="rounded-3xl border-stone-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-sm text-stone-500">{item.label}</div>
                <div className="mt-2 text-3xl font-semibold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>投稿確認画面</CardTitle>
            <CardDescription>
              投稿された作品を確認し、公開・保留・却下を管理します。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "すべて", value: "all" },
                { label: "未確認", value: "submitted" },
                { label: "保留", value: "pending" },
                { label: "公開済み", value: "published" },
                { label: "却下", value: "rejected" },
              ].map((filter) => {
                const isActive = statusFilter === filter.value;

                return (
                  <Button
                    key={filter.value}
                    asChild
                    variant={isActive ? "default" : "outline"}
                    className="rounded-2xl"
                  >
                    <Link
                      href={
                        filter.value === "all"
                          ? "/admin/submissions"
                          : `/admin/submissions?status=${filter.value}`
                      }
                    >
                      {filter.label}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                読み込みに失敗しました: {error.message}
              </div>
            )}

            {!error && filteredSubmissions.length === 0 && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                この条件に当てはまる投稿はありません。
              </div>
            )}

            {filteredSubmissions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-stone-500">
                      {item.pen_name} ・ {item.category} ・ {new Date(item.created_at).toLocaleString("ja-JP")}
                    </div>
                  </div>
                  <Badge className="rounded-full">{item.status ?? "submitted"}</Badge>
                </div>

                {item.summary && (
                  <p className="mb-3 text-sm leading-6 text-stone-700">{item.summary}</p>
                )}

                <div className="mb-3 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-700">
                  {item.content.length > 180
                    ? `${item.content.slice(0, 180)}…`
                    : item.content}
                </div>

                <div className="mb-3 grid gap-2 text-sm text-stone-600 md:grid-cols-2">
                  <div>メール: {item.email}</div>
                  <div>文学タイプ: {item.literary_type === "popular" ? "大衆文学" : "純文学"}</div>
                  <div>
                    棚タグ: {
                      item.shelf_tag === "mystery" ? "推理" :
                      item.shelf_tag === "romance" ? "恋愛" :
                      item.shelf_tag === "dream" ? "夢" :
                      item.shelf_tag === "strange" ? "怪異" :
                      item.shelf_tag === "family" ? "家族" :
                      item.shelf_tag === "city" ? "都市" :
                      item.shelf_tag === "experimental" ? "実験" :
                      "その他"
                    }
                  </div>
                  <div>
                    背表紙の色: {
                      item.cover_color === "ink" ? "墨" :
                      item.cover_color === "navy" ? "紺碧" :
                      item.cover_color === "emerald" ? "深緑" :
                      item.cover_color === "burgundy" ? "臙脂" :
                      item.cover_color === "amber" ? "朽葉" :
                      item.cover_color === "violet" ? "紫紺" :
                      "灰青"
                    }
                  </div>
                  <div>
                    装丁スタイル: {
                      item.cover_style === "minimal" ? "静かな装丁" :
                      item.cover_style === "classic" ? "古典的な装丁" :
                      item.cover_style === "soft" ? "柔らかな装丁" :
                      item.cover_style === "heavy" ? "重たい装丁" :
                      "鋭い装丁"
                    }
                  </div>
                  <div>朗読許可: {item.allow_read_aloud ? "可" : "不可"}</div>
                  <div>SNS紹介許可: {item.allow_sns_promo ? "可" : "不可"}</div>
                  {item.external_url && <div className="md:col-span-2">外部リンク: {item.external_url}</div>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <details className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                    <summary className="cursor-pointer font-medium">内容確認</summary>
                    <div className="mt-3 whitespace-pre-wrap leading-7 text-stone-800">
                      {item.content}
                    </div>
                  </details>

                  <form action={markAsPending}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="outline" className="rounded-2xl">
                      保留
                    </Button>
                  </form>

                  <form action={markAsPublished}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" className="rounded-2xl">
                      公開
                    </Button>
                  </form>
                  <form action={markAsRejected}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="outline" className="rounded-2xl">
                      却下
                    </Button>
                  </form>
                  <form action={deleteSubmission}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" variant="outline" className="rounded-2xl">
                      削除
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>記録管理</CardTitle>
            <CardDescription>
              寄せられた読みの記録を確認し、ふざけた内容や誹謗中傷などを削除できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recordsError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                記録の読み込みに失敗しました: {recordsError.message}
              </div>
            )}

            {!recordsError && readingRecords.length === 0 && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                まだ寄せられた記録はありません。
              </div>
            )}

            {readingRecords.map((record) => {
              const parent = submissionMap.get(record.submission_id);
              const displayName = record.is_anonymous ? "匿名" : record.display_name || "無名";

              return (
                <div key={record.id} className="rounded-2xl border border-stone-200 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{parent ? `『${parent.title}』への記録` : `作品ID ${record.submission_id} への記録`}</div>
                      <div className="text-sm text-stone-500">
                        {displayName} ・ {new Date(record.created_at).toLocaleString("ja-JP")}
                      </div>
                    </div>
                    <Badge className="rounded-full">{record.is_public ? "公開" : "非公開"}</Badge>
                  </div>

                  <div className="mb-3 grid gap-2 text-sm text-stone-600 md:grid-cols-2">
                    <div>元作品: {parent ? `${parent.title} / ${parent.pen_name}` : "不明"}</div>
                    <div>匿名設定: {record.is_anonymous ? "匿名" : "名前表示"}</div>
                  </div>

                  <div className="mb-3 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-700">
                    {record.body.length > 220 ? `${record.body.slice(0, 220)}…` : record.body}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <details className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                      <summary className="cursor-pointer font-medium">内容確認</summary>
                      <div className="mt-3 whitespace-pre-wrap leading-7 text-stone-800">
                        {record.body}
                      </div>
                    </details>

                    <form action={deleteReadingRecord}>
                      <input type="hidden" name="id" value={record.id} />
                      <Button type="submit" variant="outline" className="rounded-2xl">
                        削除
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}