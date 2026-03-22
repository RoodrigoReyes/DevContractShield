import "server-only"

const BACKEND_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

interface BackendRequestOptions {
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  readonly headers?: HeadersInit
  readonly body?: BodyInit | null
  readonly accessToken?: string
}

class BackendRequestError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "BackendRequestError"
    this.statusCode = statusCode
  }
}

function mergeHeaders(headers?: HeadersInit, accessToken?: string): Headers {
  const mergedHeaders = new Headers(headers)

  if (accessToken) {
    mergedHeaders.set("Authorization", `Bearer ${accessToken}`)
  }

  return mergedHeaders
}

async function parseBackendError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] }

    if (Array.isArray(payload.message)) {
      return payload.message.join(". ")
    }

    if (typeof payload.message === "string" && payload.message.length > 0) {
      return payload.message
    }

    return `Error ${response.status}`
  } catch {
    return `Error ${response.status}`
  }
}

async function request(path: string, options?: BackendRequestOptions): Promise<Response> {
  return fetch(`${BACKEND_BASE_URL}${path}`, {
    method: options?.method ?? "GET",
    headers: mergeHeaders(options?.headers, options?.accessToken),
    body: options?.body,
    cache: "no-store",
  })
}

export async function backendGetJson<TResponse>(path: string, accessToken?: string): Promise<TResponse> {
  const response = await request(path, {
    method: "GET",
    accessToken,
  })

  if (!response.ok) {
    const message = await parseBackendError(response)
    throw new BackendRequestError(message, response.status)
  }

  return (await response.json()) as TResponse
}

export async function backendPostJson<TRequest, TResponse>(
  path: string,
  payload: TRequest,
  accessToken?: string
): Promise<TResponse> {
  const response = await request(path, {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await parseBackendError(response)
    throw new BackendRequestError(message, response.status)
  }

  return (await response.json()) as TResponse
}

export function getBackendErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof BackendRequestError) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return fallbackMessage
}
