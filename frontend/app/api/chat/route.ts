import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { backendPostJson, getBackendErrorMessage } from "@/lib/backend/client"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session"
import type { ChatMessagePayload, ChatResponse } from "@/lib/backend/types"

export const runtime = "nodejs"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 })
    }

    const body = (await request.json()) as ChatMessagePayload
    const response = await backendPostJson<ChatMessagePayload, ChatResponse>(
      "/chat/message",
      body,
      accessToken
    )

    return NextResponse.json(response)
  } catch (error: unknown) {
    const message = getBackendErrorMessage(error, "No se pudo enviar el mensaje al asistente.")
    return NextResponse.json({ message }, { status: 500 })
  }
}
