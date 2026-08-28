export type AccountType = 'ENTERPRISE' | 'COOPERATIVE' | 'INSPECTOR' | 'ADMIN'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type EscrowState = 'LOCKED' | 'RELEASED' | 'REFUNDED'

export interface Account {
  id: string
  organizationId?: string | null
  email: string
  stellarAddress?: string | null
  type: AccountType
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  avatarUrl?: string | null
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Contract {
  id: string
  contractNumber: string
  buyerId: string
  sellerId: string
  cropType: string
  quantity: number
  unitPrice: number
  totalPrice: number
  escrowTxId?: string | null
  escrowState: EscrowState
  status: TransactionStatus
  deliveryDate: string
  deliveryLocation?: string | null
  createdAt: string
  updatedAt: string
}

export interface ContractStats {
  totalContracts: number
  totalValue: number
  pendingContracts: number
  completedContracts: number
}

export interface ContractListResponse {
  contracts: Contract[]
  stats: ContractStats
}

export interface ContractCreateInput {
  sellerId: string
  cropType: string
  quantity: number
  unitPrice: number
  deliveryDate: string
  deliveryLocation?: string
}

export interface ContractUpdateInput {
  status?: TransactionStatus
  escrowState?: EscrowState
  deliveryLocation?: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  user: Account
}

export interface RegisterResponse {
  message: string
  user: Account
}

export interface RegisterInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
  type: AccountType
}

export interface Forecast {
  id: string
  cropType: string
  region: string
  predictedDemand: number
  confidence: number
  forecastDate: string
  timeHorizon: number
  factors: Record<string, number>
}

export interface HistoricalForecast {
  cropType: string
  region: string
  data: Array<{ month: number; demand: number; actual: number }>
}

export interface HealthStatus {
  status: string
  timestamp: string
  uptime: number
  environment: string
}
