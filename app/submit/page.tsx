"use client";

import { useState } from "react";
import RebornShell from "@/components/reborn/shell";
import { categories } from "@/lib/sample-data";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SubmitPage() {
  const [penName, setPenName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [allowReadAloud, setAllowReadAloud] = useState(false);
  const [allowSnsPromo, setAllowSnsPromo] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setMessage("");

    if (!penName || !email || !title || !selectedCategory || !content) {
      setMessage("必須項目を入力してください。");
      return;
    }

    if (!agreed) {
      setMessage("利用規約とプライバシーポリシーへの同意が必要です。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("submissions").insert([
      {
        pen_name: penName,
        email,
        title,
        category: selectedCategory,
        summary,
        content,
        external_url: externalUrl || null,
        allow_read_aloud: allowReadAloud,
        allow_sns_promo: allowSnsPromo,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage(`送信に失敗しました: ${error.message}`);
      return;
    }

    setMessage("投稿を受け付けました。確認後、公開されます。");

    setPenName("");
    setEmail("");
    setTitle("");
    setSelectedCategory("");
    setSummary("");
    setContent("");
    setExternalUrl("");
    setAllowReadAloud(false);
    setAllowSnsPromo(false);
    setAgreed(false);
  };

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
            <Input
              className="rounded-2xl"
              placeholder="ペンネーム"
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
            />
            <Input
              className="rounded-2xl"
              placeholder="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            className="rounded-2xl"
            placeholder="作品タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

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

          <Textarea
            className="min-h-[120px] rounded-2xl"
            placeholder="概要（任意）"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <Textarea
            className="min-h-[260px] rounded-2xl"
            placeholder="本文"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Input
            className="rounded-2xl"
            placeholder="外部リンク（任意）"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />

          <div className="grid gap-3 rounded-2xl border border-stone-200 p-4 text-sm text-stone-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowReadAloud}
                onChange={(e) => setAllowReadAloud(e.target.checked)}
              />
              朗読掲載を許可する
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowSnsPromo}
                onChange={(e) => setAllowSnsPromo(e.target.checked)}
              />
              SNSでの紹介を許可する
            </label>

            <div className="flex items-start gap-2">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
              <span>利用規約とプライバシーポリシーに同意する</span>
            </div>
          </div>

          {message && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              {message}
            </div>
          )}

          <div>
            <Button
              disabled={!agreed || loading}
              className="rounded-2xl"
              onClick={handleSubmit}
            >
              {loading ? "送信中..." : "投稿を送信"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </RebornShell>
  );
}