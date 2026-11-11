import { IAgriculturalBatchRepository } from '../../repositories/agricultural-batch.repository.interface.js';
import { AgriculturalBatch, BatchCreateInput } from '../../entities/agricultural-batch.entity.js';

export class CreateBatchUseCase {
  constructor(private readonly batchRepository: IAgriculturalBatchRepository) {}

  async execute(input: BatchCreateInput): Promise<AgriculturalBatch> {
    return this.batchRepository.create(input);
  }
}
