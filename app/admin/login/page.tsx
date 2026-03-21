"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RebornShell from "@/components/reborn/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = "/admin/submissions";

  async function handleLogin() {
    setLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      setErrorMessage(result.error || "ログインに失敗しました。");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <RebornShell>
      <div className="mx-auto max-w-xl">
        <Card className="rounded-3xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>管理画面ログイン</CardTitle>
            <CardDescription>
              管理画面へ入るにはパスワードが必要です。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              type="password"
              className="rounded-2xl"
              placeholder="管理用パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleLogin();
                }
              }}
            />

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div>
              <Button
                className="rounded-2xl"
                onClick={() => void handleLogin()}
                disabled={loading || !password}
              >
                {loading ? "確認中..." : "ログイン"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RebornShell>
  );
}