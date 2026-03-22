import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE, getRoleHomePath, parseRole } from "@/lib/auth/session"

export default async function Home() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const role = parseRole(cookieStore.get(ROLE_COOKIE)?.value)

  if (!accessToken) {
    redirect("/login")
  }

  redirect(getRoleHomePath(role))
}
