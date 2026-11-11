import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateBatchUseCase } from './create-batch.use-case';
import { IAgriculturalBatchRepository } from '../../repositories/agricultural-batch.repository.interface';
import { BatchStatus } from '../../entities/agricultural-batch.entity';

describe('CreateBatchUseCase', () => {
  let useCase: CreateBatchUseCase;
  let mockRepository: IAgriculturalBatchRepository;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByBatchNumber: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new CreateBatchUseCase(mockRepository);
  });

  it('should delegate creation to the repository', async () => {
    const input = {
      farmerId: 'farmer-1',
      cropType: 'Wheat',
      varietyName: 'Hard Red Winter',
      quantityKg: 5000,
      harvestDate: new Date('2025-10-01'),
      originLocation: 'Kansas, USA',
    };

    const expected = {
      id: 'batch-1',
      batchNumber: 'BATCH-20251001-ABCD',
      contractId: undefined,
      farmerId: input.farmerId,
      cropType: input.cropType,
      varietyName: input.varietyName,
      quantityKg: input.quantityKg,
      qualityGrade: undefined,
      harvestDate: input.harvestDate,
      originLocation: input.originLocation,
      destinationLocation: undefined,
      status: BatchStatus.CREATED,
      stellarTxId: undefined,
      metadata: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.create).mockResolvedValue(expected);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(result.batchNumber).toBe(expected.batchNumber);
    expect(result.status).toBe(BatchStatus.CREATED);
  });
});
