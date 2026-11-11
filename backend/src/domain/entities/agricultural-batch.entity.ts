export enum BatchStatus {
  CREATED = 'CREATED',
  IN_TRANSIT = 'IN_TRANSIT',
  INSPECTED = 'INSPECTED',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
}

export interface AgriculturalBatch {
  id: string;
  batchNumber: string;
  contractId?: string;
  farmerId: string;
  cropType: string;
  varietyName?: string;
  quantityKg: number;
  qualityGrade?: string;
  harvestDate: Date;
  originLocation: string;
  destinationLocation?: string;
  status: BatchStatus;
  stellarTxId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchCreateInput {
  contractId?: string;
  farmerId: string;
  cropType: string;
  varietyName?: string;
  quantityKg: number;
  qualityGrade?: string;
  harvestDate: Date;
  originLocation: string;
  destinationLocation?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchUpdateInput {
  status?: BatchStatus;
  qualityGrade?: string;
  destinationLocation?: string;
  stellarTxId?: string;
  metadata?: Record<string, unknown>;
}
