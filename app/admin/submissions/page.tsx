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
  summary: string | null;
  content: string;
  external_url: string | null;
  allow_read_aloud: boolean;
  allow_sns_promo: boolean;
  status: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminSubmissionsPage() {
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

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const submissions: Submission[] = data ?? [];

  const unreviewedCount = submissions.filter((item) => item.status === "submitted").length;
  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const publishedCount = submissions.filter((item) => item.status === "published").length;

  return (
    <RebornShell>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "未確認", value: String(unreviewedCount) },
            { label: "保留", value: String(pendingCount) },
            { label: "公開済み", value: String(publishedCount) },
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
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                読み込みに失敗しました: {error.message}
              </div>
            )}

            {!error && submissions.length === 0 && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                まだ投稿はありません。
              </div>
            )}

            {submissions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-stone-500">
                      {item.pen_name} ・ {item.category} ・{" "}
                      {new Date(item.created_at).toLocaleString("ja-JP")}
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

                <div className="mb-3 space-y-1 text-sm text-stone-600">
                  <div>メール: {item.email}</div>
                  <div>朗読許可: {item.allow_read_aloud ? "可" : "不可"}</div>
                  <div>SNS紹介許可: {item.allow_sns_promo ? "可" : "不可"}</div>
                  {item.external_url && <div>外部リンク: {item.external_url}</div>}
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}