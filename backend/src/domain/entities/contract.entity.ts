export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum EscrowState {
  LOCKED = 'LOCKED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export interface Contract {
  id: string;
  organizationId?: string;
  contractNumber: string;
  buyerId: string;
  sellerId: string;
  cropType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  escrowTxId?: string;
  escrowState: EscrowState;
  status: TransactionStatus;
  deliveryDate: Date;
  deliveryLocation?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractCreateInput {
  organizationId?: string;
  buyerId: string;
  sellerId: string;
  cropType: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  contractNumber?: string;
  escrowTxId?: string;
  escrowState?: EscrowState;
  status?: TransactionStatus;
  deliveryDate: Date;
  deliveryLocation?: string;
  metadata?: Record<string, unknown>;
}

export interface ContractUpdateInput {
  status?: TransactionStatus;
  escrowState?: EscrowState;
  escrowTxId?: string;
  deliveryLocation?: string;
  metadata?: Record<string, unknown>;
}
