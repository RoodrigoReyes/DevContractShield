export interface TerminalLogEntry {
  id: number
  timestamp: string
  level: "info" | "warn" | "error" | "success"
  message: string
}

export const TERMINAL_DATA: TerminalLogEntry[] = [
  { id: 1, timestamp: "02:55:44", level: "info", message: "Transaccion recibida en GenLayer" },
  { id: 2, timestamp: "02:55:44", level: "info", message: "Hash: 0xc803a2bf...bed75a02" },
  { id: 3, timestamp: "02:55:44", level: "info", message: "From: 0x9452fffF...dd2714C3" },
  { id: 4, timestamp: "02:55:44", level: "info", message: "To: 0xbEE7fb0A...aFf99fEe" },
  { id: 5, timestamp: "02:55:45", level: "info", message: "Metodo detectado: submit_evidence" },
  { id: 6, timestamp: "02:55:45", level: "info", message: "Contract ID: sandbox-001 | Submission ID: sub-sandbox-001" },
  { id: 7, timestamp: "02:55:45", level: "info", message: "Stack: react-javascript | runner: vitest@3.1.1 | linter: eslint@9.0.0" },
  { id: 8, timestamp: "02:55:45", level: "info", message: "Runtime: node 23.11.1 | npm 10.9.2 | command: npm test" },
  { id: 9, timestamp: "02:55:46", level: "warn", message: "Proposed result: accepted (pendiente de consenso)" },
  { id: 10, timestamp: "02:55:49", level: "info", message: "Fase PROPOSING completada, validadores seleccionados" },
  { id: 11, timestamp: "02:55:59", level: "info", message: "Fase COMMITTING finalizada, 5/5 votos AGREE" },
  { id: 12, timestamp: "02:55:59", level: "success", message: "Fase REVEALING completada" },
  { id: 13, timestamp: "02:55:59", level: "success", message: "Estado de consenso: ACCEPTED" },
  { id: 14, timestamp: "02:56:00", level: "success", message: "Execution result: SUCCESS en leader y validators" },
  { id: 15, timestamp: "02:56:00", level: "info", message: "Status trail: PENDING -> PROPOSING -> COMMITTING -> REVEALING -> ACCEPTED" },
]
