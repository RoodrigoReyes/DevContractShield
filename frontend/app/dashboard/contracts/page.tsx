"use client"

import { type ReactElement, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { STATUS_CONFIG, FINALIZED_STATUSES } from "@/lib/contract-status"
import type { ApiContract, ApiContractsResponse, ApiUser } from "@/lib/backend/types"

interface RepositoryFormState {
  readonly value: string
  readonly isSaving: boolean
}

type RepositoryFormMap = Record<string, RepositoryFormState>

interface RepositoryFlowInfo {
  readonly streamUrl: string
  readonly coverageUrl: string
  readonly features: string
}

type RepositoryFlowMap = Record<string, RepositoryFlowInfo>

interface SaveRepositoryResponse {
  readonly message: string
  readonly streamUrl: string
  readonly coverageUrl: string
  readonly features: string
  readonly systemStatusId: number
}

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
  } catch {
    return false
  }
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ApiContract[]>([])
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null)
  const [repoForms, setRepoForms] = useState<RepositoryFormMap>({})
  const [repoFlows, setRepoFlows] = useState<RepositoryFlowMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadContractsAndUser(): Promise<void> {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [contractsResponse, userResponse] = await Promise.all([
          fetch("/api/contracts", { cache: "no-store" }),
          fetch("/api/me", { cache: "no-store" }),
        ])

        if (!contractsResponse.ok) {
          const payload = (await contractsResponse.json()) as { message?: string }
          throw new Error(payload.message ?? "No se pudieron cargar los contratos.")
        }

        if (!userResponse.ok) {
          const payload = (await userResponse.json()) as { message?: string }
          throw new Error(payload.message ?? "No se pudo cargar el usuario.")
        }

        const contractsPayload = (await contractsResponse.json()) as ApiContractsResponse
        const userPayload = (await userResponse.json()) as ApiUser

        if (isMounted) {
          setContracts(contractsPayload.data)
          setCurrentUser(userPayload)
        }
      } catch (error: unknown) {
        if (isMounted) {
          if (error instanceof Error && error.message.length > 0) {
            setErrorMessage(error.message)
          } else {
            setErrorMessage("No se pudieron cargar los contratos.")
          }
          setContracts([])
          setCurrentUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadContractsAndUser()

    return () => {
      isMounted = false
    }
  }, [])

  const activeContracts = useMemo(
    () => contracts.filter((contract: ApiContract) => !FINALIZED_STATUSES.includes(contract.status)),
    [contracts]
  )

  const completedContracts = useMemo(
    () => contracts.filter((contract: ApiContract) => FINALIZED_STATUSES.includes(contract.status)),
    [contracts]
  )

  function getFormState(contractId: string): RepositoryFormState {
    return repoForms[contractId] ?? { value: "", isSaving: false }
  }

  function updateFormState(contractId: string, nextState: RepositoryFormState): void {
    setRepoForms((previous) => ({
      ...previous,
      [contractId]: nextState,
    }))
  }

  async function saveRepositoryUrl(contractId: string): Promise<void> {
    const formState = getFormState(contractId)
    const githubRepoUrl = formState.value.trim()

    if (!githubRepoUrl) {
      toast.error("Ingresa una URL de repositorio.")
      return
    }

    if (!isValidUrl(githubRepoUrl)) {
      toast.error("La URL debe comenzar con http:// o https://")
      return
    }

    updateFormState(contractId, {
      value: formState.value,
      isSaving: true,
    })

    try {
      const response = await fetch(`/api/contracts/${contractId}/repository`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubRepoUrl }),
      })

      const payload = (await response.json()) as Partial<SaveRepositoryResponse> & { message?: string }

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo guardar la URL.")
      }

      setContracts((previousContracts) =>
        previousContracts.map((contract) =>
          contract.id === contractId
            ? {
                ...contract,
                githubRepoUrl,
                status: payload.systemStatusId === 3 ? "testing" : contract.status,
              }
            : contract
        )
      )

      if (payload.streamUrl && payload.coverageUrl && payload.features) {
        const streamUrl = payload.streamUrl
        const coverageUrl = payload.coverageUrl
        const features = payload.features

        setRepoFlows((previous) => ({
          ...previous,
          [contractId]: {
            streamUrl,
            coverageUrl,
            features,
          },
        }))
      }

      toast.success(payload.message ?? "Repositorio guardado.")
      updateFormState(contractId, { value: "", isSaving: false })
    } catch (error: unknown) {
      if (error instanceof Error && error.message.length > 0) {
        toast.error(error.message)
      } else {
        toast.error("No se pudo guardar la URL del repositorio.")
      }

      updateFormState(contractId, {
        value: githubRepoUrl,
        isSaving: false,
      })
    }
  }

  function renderContractCard(contract: ApiContract, muted: boolean): ReactElement {
    const statusInfo = STATUS_CONFIG[contract.status]
    const formState = getFormState(contract.id)
    const flowInfo = repoFlows[contract.id]

    return (
      <Card key={contract.id} className={muted ? "opacity-75" : undefined}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/dashboard/contracts/${contract.id}`}
              className="text-sm font-medium leading-tight hover:underline"
            >
              {contract.title}
            </Link>
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-4">
              <span>{contract.developer}</span>
              <span>{contract.dueDate}</span>
            </div>
            <span className="font-medium">{contract.amountLabel}</span>
          </div>

          {contract.githubRepoUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Repo:{" "}
                <a
                  href={contract.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {contract.githubRepoUrl}
                </a>
              </p>

              {flowInfo ? (
                <div className="rounded-md border border-border p-3 text-xs text-muted-foreground">
                  <p className="mb-1">Tests iniciados en background.</p>
                  <p>
                    Stream:{" "}
                    <a href={flowInfo.streamUrl} className="text-primary underline-offset-4 hover:underline">
                      {flowInfo.streamUrl}
                    </a>
                  </p>
                  <p>
                    Coverage:{" "}
                    <a href={flowInfo.coverageUrl} className="text-primary underline-offset-4 hover:underline">
                      {flowInfo.coverageUrl}
                    </a>
                  </p>
                  <p className="mt-1 line-clamp-2">Features: {flowInfo.features}</p>
                </div>
              ) : null}
            </div>
          ) : currentUser?.isDeveloper ? (
            <div className="space-y-2 rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">
                Este contrato no tiene repositorio. Sube el enlace para continuar.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={formState.value}
                  onChange={(event) =>
                    updateFormState(contract.id, {
                      value: event.target.value,
                      isSaving: formState.isSaving,
                    })
                  }
                  placeholder="https://github.com/tu-org/tu-repo"
                  disabled={formState.isSaving}
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={() => saveRepositoryUrl(contract.id)}
                  disabled={formState.isSaving}
                >
                  {formState.isSaving ? "Guardando..." : "Guardar repo"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              El desarrollador debe subir el repositorio para este contrato.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Mis contratos</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Contratos asignados o creados</p>
          </div>
          {!currentUser?.isDeveloper ? (
            <Link href="/dashboard">
              <Button size="sm">Nuevo</Button>
            </Link>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? <p className="text-sm text-muted-foreground">Cargando contratos...</p> : null}

        {!isLoading && !errorMessage && contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay contratos para este usuario.</p>
        ) : null}

        <div className="space-y-4">
          {activeContracts.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Activos</h2>
              {activeContracts.map((contract) => renderContractCard(contract, false))}
            </div>
          ) : null}

          {completedContracts.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Historial</h2>
              {completedContracts.map((contract) => renderContractCard(contract, true))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
