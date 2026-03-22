import { NextResponse } from "next/server"
import { backendPostJson, getBackendErrorMessage } from "@/lib/backend/client"
import type { BackendLoginResponse } from "@/lib/backend/types"
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE, getRoleHomePath, resolveRole } from "@/lib/auth/session"

export const runtime = "nodejs"

interface LoginBody {
  email?: string
  password?: string
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginBody
    const email = body.email?.trim() ?? ""
    const password = body.password ?? ""

    if (!email || !password) {
      return NextResponse.json({ message: "Email y password son requeridos." }, { status: 400 })
    }

    const loginResponse = await backendPostJson<{ email: string; password: string }, BackendLoginResponse>(
      "/auth/login",
      {
        email,
        password,
      }
    )

    const role = resolveRole(loginResponse.user.isClient, loginResponse.user.isDeveloper)

    if (!role) {
      return NextResponse.json({ message: "El usuario no tiene un rol habilitado." }, { status: 403 })
    }

    const response = NextResponse.json({
      role,
      redirectTo: getRoleHomePath(role),
    })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: loginResponse.expiresIn,
    }

    response.cookies.set(ACCESS_TOKEN_COOKIE, loginResponse.accessToken, cookieOptions)
    response.cookies.set(ROLE_COOKIE, role, cookieOptions)

    return response
  } catch (error: unknown) {
    const message = getBackendErrorMessage(error, "No se pudo iniciar sesion.")
    return NextResponse.json({ message }, { status: 401 })
  }
}
