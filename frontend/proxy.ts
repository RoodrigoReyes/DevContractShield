import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE, getRoleHomePath, parseRole } from "@/lib/auth/session"

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const role = parseRole(request.cookies.get(ROLE_COOKIE)?.value)

  if (pathname.startsWith("/dashboard") && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname === "/dashboard" && role === "developer") {
    return NextResponse.redirect(new URL("/dashboard/contracts", request.url))
  }

  if ((pathname === "/" || pathname === "/login") && accessToken) {
    return NextResponse.redirect(new URL(getRoleHomePath(role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}
