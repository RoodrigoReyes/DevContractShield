"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ApiUser } from "@/lib/backend/types"

interface ProfileForm {
  readonly name: string
  readonly email: string
  readonly wallet: string
}

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    wallet: "",
  })

  useEffect(() => {
    let isMounted = true

    async function loadProfile(): Promise<void> {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetch("/api/me", { cache: "no-store" })

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string }
          throw new Error(payload.message ?? "No se pudo cargar el perfil.")
        }

        const user = (await response.json()) as ApiUser

        if (isMounted) {
          setProfile({
            name: user.fullName || user.username,
            email: user.email,
            wallet: user.walletAddress,
          })
        }
      } catch (error: unknown) {
        if (isMounted) {
          if (error instanceof Error && error.message.length > 0) {
            setErrorMessage(error.message)
          } else {
            setErrorMessage("No se pudo cargar el perfil.")
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Ajustes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Gestiona tu cuenta y preferencias
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  className="h-9"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  className="h-9"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wallet" className="text-xs">
                Wallet address
              </Label>
              <Input
                id="wallet"
                value={profile.wallet}
                onChange={(event) =>
                  setProfile((previous) => ({
                    ...previous,
                    wallet: event.target.value,
                  }))
                }
                className="h-9 font-mono text-xs"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm">Email notifications</p>
                <p className="text-xs text-muted-foreground">
                  Recibir alertas sobre tus contratos
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-border accent-primary"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm">Actualizaciones de estado</p>
                <p className="text-xs text-muted-foreground">
                  Notificar cambios en contratos
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-border accent-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  )
}
