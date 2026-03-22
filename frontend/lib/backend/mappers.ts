import type { ContractStatus } from "@/lib/contract-status"
import type { ApiContract, ApiUser, BackendContract, BackendMeResponse } from "@/lib/backend/types"

const CURRENCY = "GEN"

export function mapBackendUser(user: BackendMeResponse): ApiUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    walletAddress: user.wallet_address,
    isClient: user.is_client,
    isDeveloper: user.is_developer,
    profilePictureUrl: user.profile_picture_url,
    bio: user.bio,
    isVerified: user.is_verified,
    tokenBalance: user.token_balance,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export function mapStatusCodeToUiStatus(statusCode: string): ContractStatus {
  switch (statusCode) {
    case "created":
    case "submitted":
    case "testing":
    case "tests_completed":
    case "report_submitted":
    case "under_review":
    case "approved":
    case "rejected":
    case "appealed":
    case "finalized":
      return statusCode
    default:
      return "created"
  }
}

export function mapBackendContract(contract: BackendContract): ApiContract {
  const normalizedStatus = mapStatusCodeToUiStatus(contract.systemStatus.code)
  const amountLabel = `${contract.amount} ${CURRENCY}`

  return {
    id: String(contract.id),
    title: contract.title,
    description: contract.description,
    developer: contract.developer?.username ?? "Sin asignar",
    amount: contract.amount,
    amountLabel,
    currency: CURRENCY,
    status: normalizedStatus,
    dueDate: contract.dueDate,
    startDate: contract.startDate,
    creator: contract.creator.username,
    githubRepoUrl: contract.githubRepoUrl,
    isGithubProject: contract.isGithubProject,
    genlayerStatus: contract.genlayerStatus?.name ?? null,
    createdAt: contract.createdAt,
  }
}
