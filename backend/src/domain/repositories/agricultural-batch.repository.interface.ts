import { AgriculturalBatch, BatchCreateInput, BatchUpdateInput, BatchStatus } from '../entities/agricultural-batch.entity.js';

export interface IAgriculturalBatchRepository {
  findById(id: string): Promise<AgriculturalBatch | null>;
  findByBatchNumber(batchNumber: string): Promise<AgriculturalBatch | null>;
  create(input: BatchCreateInput): Promise<AgriculturalBatch>;
  update(id: string, input: BatchUpdateInput): Promise<AgriculturalBatch>;
  delete(id: string): Promise<void>;
  list(filters?: {
    farmerId?: string;
    contractId?: string;
    status?: BatchStatus;
    cropType?: string;
  }): Promise<AgriculturalBatch[]>;
}
