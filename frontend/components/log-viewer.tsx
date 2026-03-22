"use client"

import type { TerminalLogEntry } from "@/app/constants/terminal-data"

interface LogViewerProps {
  readonly entries: readonly TerminalLogEntry[]
}

const LEVEL_COLORS: Record<TerminalLogEntry["level"], string> = {
  info: "text-zinc-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  success: "text-green-400",
}

export function LogViewer({ entries }: LogViewerProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-black font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500" />
            <div className="size-2.5 rounded-full bg-yellow-500" />
            <div className="size-2.5 rounded-full bg-green-500" />
          </div>
          <span className="text-zinc-500">terminal</span>
        </div>
        <span className="text-zinc-500">Historial</span>
      </div>

      <div className="h-64 space-y-1 overflow-y-auto p-3">
        {entries.length === 0 ? (
          <span className="text-zinc-600">Sin logs para este contrato.</span>
        ) : (
          entries.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-zinc-600">[{log.timestamp}]</span>
              <span className={`uppercase ${LEVEL_COLORS[log.level]}`}>[{log.level}]</span>
              <span className="text-zinc-300">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
