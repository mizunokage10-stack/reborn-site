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

const literaryTypes = [
  { value: "popular", label: "大衆文学" },
  { value: "pure", label: "純文学" },
];

const shelfTags = [
  { value: "mystery", label: "推理" },
  { value: "romance", label: "恋愛" },
  { value: "dream", label: "夢" },
  { value: "strange", label: "怪異" },
  { value: "family", label: "家族" },
  { value: "city", label: "都市" },
  { value: "experimental", label: "実験" },
  { value: "other", label: "その他" },
];

const coverColors = [
  { value: "ink", label: "墨" },
  { value: "navy", label: "紺碧" },
  { value: "emerald", label: "深緑" },
  { value: "burgundy", label: "臙脂" },
  { value: "amber", label: "朽葉" },
  { value: "violet", label: "紫紺" },
  { value: "grayblue", label: "灰青" },
];

const coverStyles = [
  { value: "minimal", label: "静かな装丁" },
  { value: "classic", label: "古典的な装丁" },
  { value: "soft", label: "柔らかな装丁" },
  { value: "heavy", label: "重たい装丁" },
  { value: "sharp", label: "鋭い装丁" },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SubmitPage() {
  const [penName, setPenName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLiteraryType, setSelectedLiteraryType] = useState("pure");
  const [selectedShelfTag, setSelectedShelfTag] = useState("other");
  const [selectedCoverColor, setSelectedCoverColor] = useState("ink");
  const [selectedCoverStyle, setSelectedCoverStyle] = useState("minimal");
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

    if (!penName.trim()) {
      setMessage("ペンネームを入力してください。");
      return;
    }

    if (!email.trim()) {
      setMessage("メールアドレスを入力してください。");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setMessage("正しいメールアドレス形式で入力してください。");
      return;
    }

    if (!title.trim()) {
      setMessage("作品タイトルを入力してください。");
      return;
    }

    if (!selectedCategory) {
      setMessage("カテゴリを選択してください。");
      return;
    }

    if (!selectedLiteraryType) {
      setMessage("文学タイプを選択してください。");
      return;
    }

    if (!selectedShelfTag) {
      setMessage("棚タグを選択してください。");
      return;
    }

    if (!content.trim()) {
      setMessage("本文を入力してください。");
      return;
    }

    if (!agreed) {
      setMessage("利用規約とプライバシーポリシーへの同意が必要です。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("submissions").insert([
      {
        pen_name: penName.trim(),
        email: email.trim(),
        title: title.trim(),
        category: selectedCategory,
        literary_type: selectedLiteraryType,
        shelf_tag: selectedShelfTag,
        cover_color: selectedCoverColor,
        cover_style: selectedCoverStyle,
        summary: summary.trim() || null,
        content: content.trim(),
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
    setSelectedLiteraryType("pure");
    setSelectedShelfTag("other");
    setSelectedCoverColor("ink");
    setSelectedCoverStyle("minimal");
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
            <div className="grid gap-2">
              <label className="text-sm font-medium text-stone-700">
                ペンネーム <span className="text-red-500">*</span>
              </label>
              <Input
                className="rounded-2xl"
                placeholder="ペンネーム"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-stone-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                className="rounded-2xl"
                placeholder="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              作品タイトル <span className="text-red-500">*</span>
            </label>
            <Input
              className="rounded-2xl"
              placeholder="作品タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              カテゴリ <span className="text-red-500">*</span>
            </label>
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
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              文学タイプ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {literaryTypes.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={selectedLiteraryType === item.value ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSelectedLiteraryType(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              棚タグ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {shelfTags.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={selectedShelfTag === item.value ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSelectedShelfTag(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              背表紙の色
            </label>
            <div className="flex flex-wrap gap-2">
              {coverColors.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={selectedCoverColor === item.value ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSelectedCoverColor(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              装丁スタイル
            </label>
            <div className="flex flex-wrap gap-2">
              {coverStyles.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={selectedCoverStyle === item.value ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSelectedCoverStyle(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            className="min-h-[120px] rounded-2xl"
            placeholder="概要（任意）"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <div className="grid gap-2">
            <label className="text-sm font-medium text-stone-700">
              本文 <span className="text-red-500">*</span>
            </label>
            <Textarea
              className="min-h-[260px] rounded-2xl"
              placeholder="本文"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

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

          <div className="text-xs text-stone-500">
            <span className="text-red-500">*</span> は必須項目です。
          </div>

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