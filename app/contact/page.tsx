

import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>一般問い合わせ、修正依頼、削除依頼、権利関連の連絡を受け付けます。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input className="rounded-2xl" placeholder="お名前またはペンネーム" />
          <Input className="rounded-2xl" placeholder="メールアドレス" type="email" />
          <Textarea className="min-h-[220px] rounded-2xl" placeholder="内容" />
          <Button className="w-fit rounded-2xl">送信する</Button>
        </CardContent>
      </Card>
    </RebornShell>
  );
}