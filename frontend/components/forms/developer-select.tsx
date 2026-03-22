"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { DeveloperOption } from "@/lib/backend/types"

interface Developer {
  readonly value: string
  readonly label: string
}

interface DeveloperSelectProps {
  readonly value: string
  readonly onChange: (value: string) => void
}

export function DeveloperSelect({ value, onChange }: DeveloperSelectProps) {
  const [open, setOpen] = useState(false)
  const [developers, setDevelopers] = useState<ReadonlyArray<Developer>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        const response = await fetch("/api/users?isDeveloper=true")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = (await response.json()) as DeveloperOption[]
        setDevelopers(
          data.map((user) => ({
            value: String(user.id),
            label: user.fullName || user.username,
          }))
        )
      } catch {
        setDevelopers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchDevelopers()
  }, [])

  const selectedDeveloper = developers.find((d) => d.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" />}
        className="flex h-9 w-full items-center justify-between px-3 py-1 text-sm"
      >
        {isLoading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Cargando...
          </span>
        ) : selectedDeveloper ? (
          selectedDeveloper.label
        ) : (
          "Seleccionar desarrollador"
        )}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar desarrollador..." />
          <CommandList>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              {developers.map((developer) => (
                <CommandItem
                  key={developer.value}
                  value={developer.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                  )}
                >
                  <span className="absolute left-2 flex size-4 items-center justify-center">
                    <Check
                      className={cn(
                        "size-4",
                        value === developer.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </span>
                  {developer.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
