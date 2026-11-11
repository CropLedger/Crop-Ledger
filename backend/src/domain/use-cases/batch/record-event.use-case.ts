import { ITraceabilityEventRepository } from '../../repositories/traceability-event.repository.interface.js';
import { IAgriculturalBatchRepository } from '../../repositories/agricultural-batch.repository.interface.js';
import { TraceabilityEvent, TraceabilityEventCreateInput, EventType } from '../../entities/traceability-event.entity.js';
import { BatchStatus } from '../../entities/agricultural-batch.entity.js';

const EVENT_TO_STATUS: Partial<Record<EventType, BatchStatus>> = {
  [EventType.HARVEST]: BatchStatus.CREATED,
  [EventType.TRANSPORT_START]: BatchStatus.IN_TRANSIT,
  [EventType.QUALITY_CHECK]: BatchStatus.INSPECTED,
  [EventType.DELIVERY]: BatchStatus.DELIVERED,
  [EventType.REJECTION]: BatchStatus.REJECTED,
};

export class RecordEventUseCase {
  constructor(
    private readonly eventRepository: ITraceabilityEventRepository,
    private readonly batchRepository: IAgriculturalBatchRepository,
  ) {}

  async execute(input: TraceabilityEventCreateInput): Promise<TraceabilityEvent> {
    const batch = await this.batchRepository.findById(input.batchId);
    if (!batch) throw new Error(`Batch ${input.batchId} not found`);

    const event = await this.eventRepository.create(input);

    const newStatus = EVENT_TO_STATUS[input.eventType];
    if (newStatus && newStatus !== batch.status) {
      await this.batchRepository.update(input.batchId, { status: newStatus });
    }

    return event;
  }
}
