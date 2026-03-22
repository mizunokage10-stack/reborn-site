"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Library, PanelLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-stone-700 transition hover:text-stone-950"
    >
      {children}
    </Link>
  );
}

export default function RebornShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPage = pathname.startsWith("/admin");

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen bg-[#faf9f7] text-stone-900"
      style={{
        fontFamily:
          '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "Times New Roman", serif',
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 md:px-6">
        <header className="mb-6 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-stone-200 p-2">
                <Library className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold">Reborn</div>
                <div className="text-sm text-stone-500">文学のための、静かな書架</div>
              </div>
            </div>

            {!isAdminPage ? (
              <nav className="flex flex-wrap items-center gap-5">
                <HeaderLink href="/">トップ</HeaderLink>
                <HeaderLink href="/works">書架</HeaderLink>
                <HeaderLink href="/submit">投稿する</HeaderLink>
              </nav>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="ghost" className="rounded-2xl">
                  <Link href="/admin/submissions">
                    <PanelLeft className="mr-2 h-4 w-4" />
                    投稿管理
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {!isAdminPage && (
          <footer className="mt-10 border-t border-stone-200 py-6 text-sm text-stone-500">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Link href="/about" className="transition hover:text-stone-900">
                About
              </Link>
              <span>·</span>
              <Link href="/contact" className="transition hover:text-stone-900">
                Contact
              </Link>
              <span>·</span>
              <Link href="/terms" className="transition hover:text-stone-900">
                Terms
              </Link>
              <span>·</span>
              <Link href="/privacy" className="transition hover:text-stone-900">
                Privacy
              </Link>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}