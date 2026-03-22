import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendGetJson, getBackendErrorMessage } from "@/lib/backend/client"
import { mapBackendUser } from "@/lib/backend/mappers"
import type { BackendMeResponse } from "@/lib/backend/types"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 })
    }

    const backendUser = await backendGetJson<BackendMeResponse>("/users/me", accessToken)
    return NextResponse.json(mapBackendUser(backendUser))
  } catch (error: unknown) {
    const message = getBackendErrorMessage(error, "No se pudo obtener el perfil.")
    return NextResponse.json({ message }, { status: 500 })
  }
}
