import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("TOKEN")?.value || null;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/", "/select-team", "/game"];
  const authRoutes = ["/auth/login", "/auth/sign-up"];

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL("/select-team", request.url));
    }
    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/select-team", "/game", "/auth/login", "/auth/sign-up"],
};
