import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendGetJson, getBackendErrorMessage } from "@/lib/backend/client"
import { mapBackendContract } from "@/lib/backend/mappers"
import type { BackendContract, BackendContractsResponse } from "@/lib/backend/types"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session"

export const runtime = "nodejs"

interface ContractDetailRouteProps {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: ContractDetailRouteProps): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 })
    }

    const { id } = await params
    const response = await backendGetJson<BackendContractsResponse>("/contracts", accessToken)

    const contract = response.data.find((item: BackendContract) => String(item.id) === id)

    if (!contract) {
      return NextResponse.json({ message: "Contrato no encontrado." }, { status: 404 })
    }

    return NextResponse.json(mapBackendContract(contract))
  } catch (error: unknown) {
    const message = getBackendErrorMessage(error, "No se pudo obtener el contrato.")
    return NextResponse.json({ message }, { status: 500 })
  }
}
