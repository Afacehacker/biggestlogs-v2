import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never intercept NextAuth's own API routes — let them pass through freely
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/admin");

  // Redirect unauthenticated users to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Block non-admins from the admin panel
  if (pathname.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect already-logged-in users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/orders/:path*",
    "/api/user/:path*",
    "/api/admin/:path*",
    "/login",
    "/register",
  ],
};
