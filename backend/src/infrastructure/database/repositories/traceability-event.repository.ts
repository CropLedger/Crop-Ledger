import { supabase } from '../supabase-client.js';
import { TraceabilityEvent, TraceabilityEventCreateInput } from '../../../domain/entities/traceability-event.entity.js';
import { ITraceabilityEventRepository } from '../../../domain/repositories/traceability-event.repository.interface.js';

export class TraceabilityEventRepository implements ITraceabilityEventRepository {
  async findById(id: string): Promise<TraceabilityEvent | null> {
    const { data, error } = await supabase
      .from('traceability_events')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async create(input: TraceabilityEventCreateInput): Promise<TraceabilityEvent> {
    const { data, error } = await supabase
      .from('traceability_events')
      .insert({
        batch_id: input.batchId,
        event_type: input.eventType,
        actor_id: input.actorId,
        location: input.location ?? null,
        temperature: input.temperature ?? null,
        humidity: input.humidity ?? null,
        notes: input.notes ?? null,
        metadata: input.metadata ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create traceability event: ${error.message}`);
    return this.mapToEntity(data);
  }

  async listByBatch(batchId: string): Promise<TraceabilityEvent[]> {
    const { data, error } = await supabase
      .from('traceability_events')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to list events: ${error.message}`);
    return (data ?? []).map(r => this.mapToEntity(r));
  }

  private mapToEntity(row: any): TraceabilityEvent {
    return {
      id: row.id,
      batchId: row.batch_id,
      eventType: row.event_type,
      actorId: row.actor_id,
      location: row.location,
      temperature: row.temperature,
      humidity: row.humidity,
      notes: row.notes,
      stellarTxId: row.stellar_tx_id,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
    };
  }
}
