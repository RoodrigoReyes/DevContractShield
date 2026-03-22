export type AppRole = "client" | "developer"

export const ACCESS_TOKEN_COOKIE = "dcs_access_token"
export const ROLE_COOKIE = "dcs_role"

export function resolveRole(isClient: boolean, isDeveloper: boolean): AppRole | null {
  if (isClient) {
    return "client"
  }

  if (isDeveloper) {
    return "developer"
  }

  return null
}

export function parseRole(value: string | undefined): AppRole | null {
  if (value === "client" || value === "developer") {
    return value
  }

  return null
}

export function getRoleHomePath(role: AppRole | null): string {
  if (role === "developer") {
    return "/dashboard/contracts"
  }

  return "/dashboard"
}
