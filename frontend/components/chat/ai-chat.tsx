"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Sparkles, FileCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatResponse } from "@/lib/backend/types"

interface ChatMessage {
  readonly id: string
  readonly role: "user" | "assistant"
  readonly content: string
  readonly timestamp: Date
  readonly requirements?: string | null
}

interface AiChatProps {
  readonly className?: string
  readonly contractDescription?: string
  readonly onRequirementsGenerated?: (requirements: string) => void
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "¡Hola! Soy tu asistente para definir los requerimientos de pruebas de tu contrato. Cuéntame sobre tu proyecto y te ayudaré a definir qué pruebas necesitas.",
  timestamp: new Date(),
}

export function AiChat({ className, contractDescription, onRequirementsGenerated }: AiChatProps) {
  const [messages, setMessages] = useState<ReadonlyArray<ChatMessage>>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [appliedRequirements, setAppliedRequirements] = useState<ReadonlySet<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldScrollRef = useRef(true)

  useEffect(() => {
    if (containerRef.current && shouldScrollRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
        shouldScrollRef.current = isAtBottom
      }
    }

    const container = containerRef.current
    container?.addEventListener("scroll", handleScroll, { passive: true })
    return () => container?.removeEventListener("scroll", handleScroll)
  }, [])

  const handleApplyRequirements = useCallback(
    (messageId: string, requirements: string) => {
      onRequirementsGenerated?.(requirements)
      setAppliedRequirements((prev) => new Set([...prev, messageId]))
    },
    [onRequirementsGenerated]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const history = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history, contractDescription }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message ?? `Error ${response.status}`)
      }

      const data = (await response.json()) as ChatResponse

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        requirements: data.requirements,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: unknown) {
      const errorContent =
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Ocurrió un error al comunicarse con el asistente. Intenta de nuevo."

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${errorContent}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4" />
          Asistente de Tests
        </CardTitle>
        <CardDescription>
          Define las pruebas unitarias para tu contrato
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
        <div
          ref={containerRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-1"
        >
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-2">
              <div
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 max-w-[85%] text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                      : "bg-muted text-foreground rounded-2xl rounded-bl-md"
                  )}
                >
                  {message.content}
                </div>
              </div>

              {message.requirements && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <FileCheck className="size-4" />
                      Requerimientos generados
                    </div>
                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 line-clamp-3 whitespace-pre-line">
                      {message.requirements}
                    </p>
                    <div className="mt-2">
                      {appliedRequirements.has(message.id) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="text-emerald-700 dark:text-emerald-300"
                        >
                          Aplicado
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleApplyRequirements(message.id, message.requirements!)
                          }
                        >
                          Aplicar al contrato
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Escribiendo...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="hidden" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t pt-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
