"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG } from "@/lib/contract-status"
import { LogViewer } from "@/components/log-viewer"
import type { ApiContract } from "@/lib/backend/types"
import { TERMINAL_DATA } from "@/app/constants/terminal-data"

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>()
  const contractId = params.id
  const [contract, setContract] = useState<ApiContract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadContract(): Promise<void> {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetch(`/api/contracts/${contractId}`, { cache: "no-store" })

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string }
          throw new Error(payload.message ?? "No se pudo cargar el contrato.")
        }

        const payload = (await response.json()) as ApiContract

        if (isMounted) {
          setContract(payload)
        }
      } catch (error: unknown) {
        if (isMounted) {
          if (error instanceof Error && error.message.length > 0) {
            setErrorMessage(error.message)
          } else {
            setErrorMessage("No se pudo cargar el contrato.")
          }
          setContract(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (contractId) {
      loadContract()
    }

    return () => {
      isMounted = false
    }
  }, [contractId])

  const statusInfo = contract ? STATUS_CONFIG[contract.status] : null

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contracts">
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{contract?.title ?? "Contrato"}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Contrato #{contractId}</p>
          </div>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Cargando contrato...</p> : null}

        {errorMessage ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {contract && statusInfo ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Detalles del contrato</h2>
                  <Badge variant="outline" className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Descripcion</p>
                  <p className="whitespace-pre-wrap text-sm">{contract.description}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">ID contrato</p>
                    <p className="text-sm font-medium">{contract.id}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Creador</p>
                    <p className="text-sm font-medium">{contract.creator}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Desarrollador</p>
                    <p className="text-sm font-medium">{contract.developer}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Monto</p>
                    <p className="text-sm font-medium">{contract.amountLabel}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Moneda</p>
                    <p className="text-sm">{contract.currency}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Fecha de inicio</p>
                    <p className="text-sm">{contract.startDate}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Fecha de entrega</p>
                    <p className="text-sm">{contract.dueDate}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Creado en</p>
                    <p className="text-sm">{contract.createdAt}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Estado interno</p>
                    <p className="text-sm">{contract.status}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Proyecto GitHub</p>
                    <p className="text-sm">{contract.isGithubProject ? "Si" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-sm font-medium">Estado actual</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium">{statusInfo.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{statusInfo.message}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-sm font-medium">Estado GenLayer</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Fase reportada por backend</p>
                <p className="mt-1 text-sm">{contract.genlayerStatus ?? "No disponible"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-sm font-medium">Repositorio</h2>
              </CardHeader>
              <CardContent className="pt-0">
                {contract.githubRepoUrl ? (
                  <a
                    href={contract.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {contract.githubRepoUrl}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin repositorio asociado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-sm font-medium">Terminal</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <LogViewer entries={TERMINAL_DATA} />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
