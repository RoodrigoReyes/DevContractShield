import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE, getRoleHomePath, parseRole } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const role = parseRole(cookieStore.get(ROLE_COOKIE)?.value)

  if (!accessToken) {
    return NextResponse.json({ authenticated: false, role: null, redirectTo: "/login" })
  }

  return NextResponse.json({
    authenticated: true,
    role,
    redirectTo: getRoleHomePath(role),
  })
}
