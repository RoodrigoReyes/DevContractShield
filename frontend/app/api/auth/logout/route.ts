import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true })

  const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", clearCookieOptions)
  response.cookies.set(ROLE_COOKIE, "", clearCookieOptions)

  return response
}
