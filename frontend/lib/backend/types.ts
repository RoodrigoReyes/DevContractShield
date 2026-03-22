import type { ContractStatus } from "@/lib/contract-status"

export interface BackendLoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: number
    username: string
    email: string
    fullName: string
    walletAddress: string
    isClient: boolean
    isDeveloper: boolean
  }
}

export interface BackendMeResponse {
  id: number
  username: string
  email: string
  full_name: string
  wallet_address: string
  is_client: boolean
  is_developer: boolean
  profile_picture_url: string | null
  bio: string | null
  is_verified: boolean
  token_balance: number
  created_at: string
  updated_at: string
}

export interface BackendContractParty {
  id: number
  username: string
}

export interface BackendSystemStatus {
  code: string
  nameEs: string
  nameEn: string
}

export interface BackendGenlayerStatus {
  code: string
  name: string
  phase: string
}

export interface BackendContract {
  id: number
  title: string
  description: string
  coverage: number
  amount: number
  startDate: string
  dueDate: string
  zipFilePath: string | null
  githubRepoUrl: string | null
  isGithubProject: boolean
  systemStatus: BackendSystemStatus
  genlayerStatus: BackendGenlayerStatus | null
  creator: BackendContractParty
  developer: BackendContractParty | null
  createdAt: string
}

export interface BackendPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface BackendContractsResponse {
  data: BackendContract[]
  pagination: BackendPagination
}

export interface ApiUser {
  id: number
  username: string
  email: string
  fullName: string
  walletAddress: string
  isClient: boolean
  isDeveloper: boolean
  profilePictureUrl: string | null
  bio: string | null
  isVerified: boolean
  tokenBalance: number
  createdAt: string
  updatedAt: string
}

export interface ApiContract {
  id: string
  title: string
  description: string
  developer: string
  amount: number
  amountLabel: string
  currency: string
  status: ContractStatus
  dueDate: string
  startDate: string
  creator: string
  githubRepoUrl: string | null
  isGithubProject: boolean
  genlayerStatus: string | null
  createdAt: string
}

export interface ApiContractsResponse {
  data: ApiContract[]
  pagination: BackendPagination
}

export interface CreateContractPayload {
  readonly title: string
  readonly amount: number
  readonly description: string
  readonly startDate: string
  readonly dueDate: string
  readonly isGithubProject: boolean
}

export interface CreateContractResponse {
  readonly id: number
  readonly title: string
  readonly description?: string
  readonly amount: number
  readonly startDate: string
  readonly dueDate: string
  readonly isGithubProject: boolean
  readonly coverage: number | null
  readonly systemStatus: {
    readonly id: number
    readonly code: string
    readonly nameEs: string
  }
  readonly creator: {
    readonly id: number
    readonly username: string
  }
  readonly developer?: {
    readonly id: number
    readonly username: string
  } | null
  readonly createdAt: string
}

export interface ChatMessagePayload {
  readonly message: string
  readonly history: ReadonlyArray<{ readonly role: 'user' | 'assistant'; readonly content: string }>
  readonly contractDescription?: string
}

export interface ChatResponse {
  readonly reply: string
  readonly requirements: string | null
}

export interface DeveloperOption {
  readonly id: string
  readonly username: string
  readonly email: string
  readonly fullName?: string
  readonly isDeveloper: boolean
  readonly profilePictureUrl?: string
}
