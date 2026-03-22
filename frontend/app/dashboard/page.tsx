"use client"

import { useState, useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Maximize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DeveloperSelect } from "@/components/forms/developer-select"
import { AiChat } from "@/components/chat/ai-chat"
import { cn } from "@/lib/utils"

const USER_WALLETS = [
  { value: "0x1a2B3c4*************************aBcDeF12", label: "0x1a2B3c4*************************aBcDeF12" },
  { value: "0x9f8E7d6*************************FeDcBa98", label: "0x9f8E7d6*************************FeDcBa98" },
]

const contractSchema = z.object({
  wallet: z.string().min(1, "Selecciona una wallet"),
  title: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  amount: z
    .string()
    .min(1, "El monto es requerido")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "El monto debe ser mayor a 0"),
  currency: z.string().min(1, "Selecciona una cryptomoneda"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  dueDate: z.string().min(1, "La fecha de entrega es requerida"),
  developer: z.string().min(1, "Selecciona un desarrollador"),
})

type ContractFormValues = z.infer<typeof contractSchema>

export default function CreateContractPage() {
  const [descriptionOpen, setDescriptionOpen] = useState(false)

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      wallet: USER_WALLETS[0]?.value ?? "",
      title: "",
      description: "",
      amount: "",
      currency: "GEN",
      startDate: "",
      dueDate: "",
      developer: "",
    },
  })

  const descriptionValue = useWatch({ control: form.control, name: "description" })

  const handleRequirementsGenerated = useCallback(
    (requirements: string) => {
      const currentDescription = form.getValues("description")

      const requirementsSeparator = "\n\n--- Requerimientos Generados por IA ---\n\n"
      const separatorIndex = currentDescription.indexOf("--- Requerimientos Generados por IA ---")

      let newValue: string
      if (currentDescription.trim().length === 0) {
        newValue = requirements
      } else if (separatorIndex !== -1) {
        // Replace existing requirements, keep original description
        const originalDescription = currentDescription.substring(0, separatorIndex).trimEnd()
        newValue = originalDescription + requirementsSeparator + requirements
      } else {
        newValue = currentDescription + requirementsSeparator + requirements
      }

      form.setValue("description", newValue, { shouldValidate: true })
      setDescriptionOpen(true)
      toast.success("Requerimientos aplicados al contrato")
    },
    [form]
  )

  async function onSubmit(values: ContractFormValues) {
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          amount: Number(values.amount),
          description: values.description,
          startDate: values.startDate,
          dueDate: values.dueDate,
          isGithubProject: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message ?? "Error al crear el contrato")
      }

      toast.success("Contrato creado exitosamente")
      form.reset()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear el contrato"
      toast.error(message)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Crear nuevo contrato</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define los detalles del proyecto con AI
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left panel: AI Chat (40%) */}
        <div className="max-h-[50vh] lg:max-h-none lg:w-[40%] lg:min-w-0">
          <AiChat
            className="h-full lg:sticky lg:top-8 lg:h-[calc(100vh-12rem)]"
            contractDescription={descriptionValue}
            onRequirementsGenerated={handleRequirementsGenerated}
          />
        </div>

        {/* Right panel: Contract form (60%) */}
        <div className="w-full lg:w-[60%]">
          <Card>
            <CardContent className="pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="wallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 font-mono text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USER_WALLETS.map((w) => (
                              <SelectItem key={w.value} value={w.value} className="font-mono text-xs">
                                {w.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del contrato</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Desarrollo de API REST"
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Descripción</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDescriptionOpen(true)}
                            title="Expandir descripción"
                          >
                            <Maximize2 className="size-3.5" />
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Describe los requisitos del proyecto..."
                            className="h-36 resize-none overflow-y-auto field-sizing-fixed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="h-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cryptomoneda</FormLabel>
                          <FormControl>
                            <Input
                              value="GEN"
                              readOnly
                              className="h-9 cursor-default bg-muted"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
                          <Popover>
                            <PopoverTrigger
                              render={<Button variant="outline" />}
                              className={cn(
                                "h-9 w-full justify-start text-left text-sm font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 size-3.5" />
                              {field.value
                                ? format(new Date(field.value + "T12:00:00"), "d MMM yyyy", { locale: es })
                                : "Selecciona fecha"}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de entrega</FormLabel>
                          <Popover>
                            <PopoverTrigger
                              render={<Button variant="outline" />}
                              className={cn(
                                "h-9 w-full justify-start text-left text-sm font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 size-3.5" />
                              {field.value
                                ? format(new Date(field.value + "T12:00:00"), "d MMM yyyy", { locale: es })
                                : "Selecciona fecha"}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="developer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desarrollador destino</FormLabel>
                        <FormControl>
                          <DeveloperSelect value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm">
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Creando..." : "Crear contrato"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description Dialog */}
      <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <DialogTitle>Descripción del contrato</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Describe los requisitos del proyecto..."
            className="h-145 resize-none overflow-y-auto field-sizing-fixed"
            value={descriptionValue}
            onChange={(e) => form.setValue("description", e.target.value)}
          />
          <DialogFooter>
            <Button type="button" size="sm" onClick={() => setDescriptionOpen(false)}>
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
