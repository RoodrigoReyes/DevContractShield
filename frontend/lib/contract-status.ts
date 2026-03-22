export type ContractStatus =
  | "created"
  | "submitted"
  | "testing"
  | "tests_completed"
  | "report_submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "appealed"
  | "finalized"

interface StatusInfo {
  label: string
  message: string
  color: string
}

export const STATUS_CONFIG: Record<ContractStatus, StatusInfo> = {
  created: {
    label: "Creado",
    message: "Esperando a que el desarrollador acepte el contrato",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  submitted: {
    label: "Entregado",
    message: "Proyecto entregado. Pendiente de ejecución de tests.",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  testing: {
    label: "Ejecutando Tests",
    message: "Ejecutando tests unitarios...",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  tests_completed: {
    label: "Tests Finalizados",
    message: "Tests finalizados. Generando reporte.",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  report_submitted: {
    label: "Reporte Enviado",
    message: "Reporte enviado a GenLayer. Esperando veredicto.",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  under_review: {
    label: "En Revisión",
    message: "Validadores evaluando el proyecto.",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  approved: {
    label: "Aprobado",
    message: "Aprobado. Fondos liberados al desarrollador.",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  rejected: {
    label: "Rechazado",
    message: "Rechazado. Fondos devueltos al cliente.",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  appealed: {
    label: "En Apelación",
    message: "Apelación en proceso. Esperando decisión final.",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  finalized: {
    label: "Finalizado",
    message: "Contrato finalizado. Decisión irreversible.",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
}

export const FINALIZED_STATUSES: ContractStatus[] = [
  "approved",
  "rejected",
  "finalized",
]
