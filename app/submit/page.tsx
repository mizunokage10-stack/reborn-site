"use client";

import { useState } from "react";
import RebornShell from "@/components/reborn/shell";
import { categories } from "@/lib/sample-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SubmitPage() {
  const [agreed, setAgreed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <RebornShell>
      <Card className="rounded-3xl border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle>作品を寄せる</CardTitle>
          <CardDescription>
            投稿作品は公開前に運営が確認します。著作権は投稿者に帰属し、掲載に必要な範囲で非独占的利用許諾を受ける形を想定しています。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input className="rounded-2xl" placeholder="ペンネーム" />
            <Input className="rounded-2xl" placeholder="メールアドレス" type="email" />
          </div>

          <Input className="rounded-2xl" placeholder="作品タイトル" />

          <div className="flex flex-wrap gap-2">
            {categories.filter((c) => c !== "すべて").map((item) => (
              <Button
                key={item}
                type="button"
                variant={selectedCategory === item ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setSelectedCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          <Textarea className="min-h-[120px] rounded-2xl" placeholder="概要（任意）" />
          <Textarea className="min-h-[260px] rounded-2xl" placeholder="本文" />
          <Input className="rounded-2xl" placeholder="外部リンク（任意）" />

          <div className="grid gap-3 rounded-2xl border border-stone-200 p-4 text-sm text-stone-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> 朗読掲載を許可する
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> SNSでの紹介を許可する
            </label>
            <div className="flex items-start gap-2">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
              <span>利用規約とプライバシーポリシーに同意する</span>
            </div>
          </div>

          <div>
            <Button disabled={!agreed} className="rounded-2xl">投稿を送信</Button>
          </div>
        </CardContent>
      </Card>
    </RebornShell>
  );
}
