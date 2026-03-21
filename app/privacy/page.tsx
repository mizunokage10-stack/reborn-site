import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle>プライバシーポリシー</CardTitle>
          <CardDescription>草案</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-stone-700">
          <p>・取得した連絡先は投稿確認、問い合わせ返信、運営連絡に用います。</p>
          <p>・法令に基づく場合を除き、第三者へ提供しません。</p>
          <p>・削除依頼や権利申立てに対応するため、一定期間情報を保持することがあります。</p>
        </CardContent>
      </Card>
    </RebornShell>
  );
}
