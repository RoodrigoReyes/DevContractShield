"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FilePlus, Files, Settings, LogOut } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ApiUser } from "@/lib/backend/types"

const navItems = [
  { label: "Crear contrato", href: "/dashboard", icon: FilePlus },
  { label: "Mis contratos", href: "/dashboard/contracts", icon: Files },
  { label: "Ajustes", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadUser(): Promise<void> {
      try {
        const response = await fetch("/api/me", { cache: "no-store" })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as ApiUser

        if (isMounted) {
          setUser(payload)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const avatarFallback = user?.fullName?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? "U"

  const avatarSource = user?.profilePictureUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username ?? "user"}`

  const roleLabel =
    user?.isClient && user?.isDeveloper
      ? "cliente / desarrollador"
      : user?.isDeveloper
        ? "desarrollador"
        : user?.isClient
          ? "cliente"
          : "usuario"

  const filteredNavItems = navItems.filter((item) => {
    if (item.href === "/dashboard" && user?.isDeveloper) {
      return false
    }

    return true
  })

  async function handleLogout(): Promise<void> {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      router.push("/login")
      router.refresh()
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Avatar className="size-8">
          <AvatarImage src={avatarSource} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user?.fullName || user?.username || "Usuario"}
          </p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 text-sm ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-4 shrink-0" />
          {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  )
}
