import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { backendGetJson, getBackendErrorMessage } from "@/lib/backend/client"
import type { DeveloperOption } from "@/lib/backend/types"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isDeveloper = searchParams.get("isDeveloper")
    const queryString = isDeveloper ? `?isDeveloper=${isDeveloper}` : ""

    const data = await backendGetJson<DeveloperOption[]>(`/users${queryString}`, accessToken)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = getBackendErrorMessage(error, "No se pudieron obtener los usuarios.")
    return NextResponse.json({ message }, { status: 500 })
  }
}
