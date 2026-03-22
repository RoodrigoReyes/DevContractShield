import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE, parseRole } from "@/lib/auth/session"
import { getBackendErrorMessage } from "@/lib/backend/client"

export const runtime = "nodejs"

const BACKEND_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

interface RepositoryPayload {
  githubRepoUrl?: string
}

interface UpdateRepositoryRouteProps {
  params: Promise<{ id: string }>
}

interface SaveGithubRepoBackendResponse {
  message: string
  streamUrl: string
  coverageUrl: string
  features: string
  systemStatusId: number
}

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
  } catch {
    return false
  }
}

export async function PATCH(
  request: Request,
  { params }: UpdateRepositoryRouteProps
): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    const role = parseRole(cookieStore.get(ROLE_COOKIE)?.value)

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 })
    }

    if (role !== "developer") {
      return NextResponse.json({ message: "Solo un desarrollador puede subir el repositorio." }, { status: 403 })
    }

    const { id } = await params
    const requestPayload = (await request.json()) as RepositoryPayload
    const githubRepoUrl = requestPayload.githubRepoUrl?.trim() ?? ""

    if (!githubRepoUrl) {
      return NextResponse.json({ message: "La URL del repositorio es requerida." }, { status: 400 })
    }

    if (!isValidUrl(githubRepoUrl)) {
      return NextResponse.json({ message: "Ingresa una URL valida (http/https)." }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_BASE_URL}/contracts/${id}/github-repo`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ githubRepoUrl }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null

      const errorMessage = Array.isArray(errorPayload?.message)
        ? errorPayload?.message.join(". ")
        : errorPayload?.message ?? "No se pudo guardar la URL del repositorio."

      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }

    const backendPayload = (await response.json()) as SaveGithubRepoBackendResponse

    return NextResponse.json({
      message: backendPayload.message,
      streamUrl: backendPayload.streamUrl,
      coverageUrl: backendPayload.coverageUrl,
      features: backendPayload.features,
      systemStatusId: backendPayload.systemStatusId,
    })
  } catch (error: unknown) {
    const message = getBackendErrorMessage(error, "No se pudo guardar la URL del repositorio.")
    return NextResponse.json({ message }, { status: 500 })
  }
}
