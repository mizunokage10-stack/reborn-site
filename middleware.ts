import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSession = request.cookies.get("reborn_admin_session")?.value;
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginPage = pathname === "/admin/login";

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  if (isAdminLoginPage) {
    return NextResponse.next();
  }

  if (!adminPassword) {
    return new NextResponse("ADMIN_PASSWORD が設定されていません。", { status: 500 });
  }

  if (adminSession === adminPassword) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};