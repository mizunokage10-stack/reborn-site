import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminHomePage() {
  const { data: submissionsData } = await supabase.from("submissions").select("status");
  const submissions = submissionsData ?? [];

  const { count: readingRecordCount } = await supabase
    .from("reading_records")
    .select("*", { count: "exact", head: true });

  const { count: gatherRequestCount } = await supabase
    .from("gather_requests")
    .select("*", { count: "exact", head: true });

  const unreviewedCount = submissions.filter((item) => item.status === "submitted").length;
  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const publishedCount = submissions.filter((item) => item.status === "published").length;
  const rejectedCount = submissions.filter((item) => item.status === "rejected").length;

  const menuItems = [
    {
      title: "投稿確認画面",
      body: "投稿作品の確認、公開、保留、却下を行います。",
      href: "/admin/submissions",
      cta: "投稿確認へ",
    },
    {
      title: "記録管理",
      body: "寄せられた読後記録を確認し、必要に応じて削除できます。",
      href: "/admin/records",
      cta: "記録管理へ",
    },
    {
      title: "集いたい管理",
      body: "読書会や対話の意思表示として寄せられた集いたいを管理します。",
      href: "/admin/gather",
      cta: "集いたい管理へ",
    },
  ];

  return (
    <RebornShell>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "未確認", value: String(unreviewedCount) },
            { label: "保留", value: String(pendingCount) },
            { label: "公開済み", value: String(publishedCount) },
            { label: "却下", value: String(rejectedCount) },
            { label: "記録", value: String(readingRecordCount ?? 0) },
            { label: "集い", value: String(gatherRequestCount ?? 0) },
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
            <CardTitle>管理メニュー</CardTitle>
            <CardDescription>
              最初にカテゴリを選び、その先で一覧を確認する構成にしています。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {menuItems.map((item) => (
              <div key={item.href} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-stone-900">{item.title}</h2>
                  <p className="text-sm leading-7 text-stone-600">{item.body}</p>
                  <Button asChild className="rounded-2xl">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}
