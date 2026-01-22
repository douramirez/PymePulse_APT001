import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Ignorar archivos estáticos y Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // ✅ Ignorar NextAuth API
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ✅ Rutas públicas
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Proteger el resto: requiere sesión
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
