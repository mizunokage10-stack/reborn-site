"use client";

import Link from "next/link";
import { Library, BookOpen, Mail, PenSquare, ShieldCheck, FileText, PanelLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function NavButton({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant="ghost" className="justify-start rounded-2xl">
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </Link>
    </Button>
  );
}

export default function RebornShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-stone-200 p-2">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">Reborn</div>
              <div className="text-sm text-stone-500">文学のための静かな書架</div>
            </div>
          </div>

          <div className="grid gap-2">
            <NavButton href="/" icon={Library}>トップ</NavButton>
            <NavButton href="/works" icon={BookOpen}>作品一覧</NavButton>
            <NavButton href="/works/umi-no-soko" icon={FileText}>作品詳細</NavButton>
            <NavButton href="/submit" icon={PenSquare}>投稿フォーム</NavButton>
            <NavButton href="/about" icon={PanelLeft}>About</NavButton>
            <NavButton href="/contact" icon={Mail}>Contact</NavButton>
            <NavButton href="/terms" icon={ShieldCheck}>Terms</NavButton>
            <NavButton href="/privacy" icon={ShieldCheck}>Privacy</NavButton>
            <NavButton href="/admin/submissions" icon={CheckCircle2}>管理画面</NavButton>
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}