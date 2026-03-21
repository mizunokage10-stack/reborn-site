

import RebornShell from "@/components/reborn/shell";
import { sampleSubmissions } from "@/lib/sample-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminSubmissionsPage() {
  return (
    <RebornShell>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "未確認", value: "4" },
            { label: "保留", value: "2" },
            { label: "公開済み", value: "18" },
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
            <CardDescription>投稿された作品を確認し、公開・保留・却下を管理します。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {sampleSubmissions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-stone-500">
                      {item.penName} ・ {item.category} ・ {item.date}
                    </div>
                  </div>
                  <Badge className="rounded-full">{item.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-2xl">内容確認</Button>
                  <Button variant="outline" className="rounded-2xl">保留</Button>
                  <Button className="rounded-2xl">公開</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}