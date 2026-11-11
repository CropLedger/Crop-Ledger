import { TraceabilityEvent, TraceabilityEventCreateInput } from '../entities/traceability-event.entity.js';

export interface ITraceabilityEventRepository {
  findById(id: string): Promise<TraceabilityEvent | null>;
  create(input: TraceabilityEventCreateInput): Promise<TraceabilityEvent>;
  listByBatch(batchId: string): Promise<TraceabilityEvent[]>;
}
