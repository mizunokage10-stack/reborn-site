

import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle>利用規約</CardTitle>
          <CardDescription>草案</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-stone-700">
          <p>・著作権は投稿者に帰属します。</p>
          <p>・運営は掲載、告知、保全のために必要な範囲で非独占的利用許諾を受けます。</p>
          <p>・権利侵害、盗作、公序良俗に反する投稿は掲載しないことがあります。</p>
          <p>・朗読やSNS紹介は、投稿時の同意内容に基づいて扱います。</p>
        </CardContent>
      </Card>
    </RebornShell>
  );
}