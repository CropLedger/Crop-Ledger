import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordEventUseCase } from './record-event.use-case';
import { ITraceabilityEventRepository } from '../../repositories/traceability-event.repository.interface';
import { IAgriculturalBatchRepository } from '../../repositories/agricultural-batch.repository.interface';
import { EventType } from '../../entities/traceability-event.entity';
import { BatchStatus } from '../../entities/agricultural-batch.entity';

const mockBatch = {
  id: 'batch-1',
  batchNumber: 'BATCH-20251001-ABCD',
  farmerId: 'farmer-1',
  cropType: 'Wheat',
  quantityKg: 5000,
  harvestDate: new Date(),
  originLocation: 'Kansas',
  status: BatchStatus.CREATED,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RecordEventUseCase', () => {
  let useCase: RecordEventUseCase;
  let mockEventRepo: ITraceabilityEventRepository;
  let mockBatchRepo: IAgriculturalBatchRepository;

  beforeEach(() => {
    mockEventRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      listByBatch: vi.fn(),
    };
    mockBatchRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByBatchNumber: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new RecordEventUseCase(mockEventRepo, mockBatchRepo);
  });

  it('should record an event and update batch status', async () => {
    vi.mocked(mockBatchRepo.findById).mockResolvedValue(mockBatch);
    const createdEvent = {
      id: 'event-1',
      batchId: 'batch-1',
      eventType: EventType.TRANSPORT_START,
      actorId: 'driver-1',
      createdAt: new Date(),
    };
    vi.mocked(mockEventRepo.create).mockResolvedValue(createdEvent);
    vi.mocked(mockBatchRepo.update).mockResolvedValue({ ...mockBatch, status: BatchStatus.IN_TRANSIT });

    const result = await useCase.execute({
      batchId: 'batch-1',
      eventType: EventType.TRANSPORT_START,
      actorId: 'driver-1',
    });

    expect(result.eventType).toBe(EventType.TRANSPORT_START);
    expect(mockBatchRepo.update).toHaveBeenCalledWith('batch-1', { status: BatchStatus.IN_TRANSIT });
  });

  it('should throw if batch not found', async () => {
    vi.mocked(mockBatchRepo.findById).mockResolvedValue(null);
    await expect(
      useCase.execute({ batchId: 'missing', eventType: EventType.HARVEST, actorId: 'x' }),
    ).rejects.toThrow('Batch missing not found');
  });
});
