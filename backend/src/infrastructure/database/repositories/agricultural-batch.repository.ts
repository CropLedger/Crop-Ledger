import { supabase } from '../supabase-client.js';
import { AgriculturalBatch, BatchCreateInput, BatchUpdateInput, BatchStatus } from '../../../domain/entities/agricultural-batch.entity.js';
import { IAgriculturalBatchRepository } from '../../../domain/repositories/agricultural-batch.repository.interface.js';

function generateBatchNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BATCH-${date}-${rand}`;
}

export class AgriculturalBatchRepository implements IAgriculturalBatchRepository {
  async findById(id: string): Promise<AgriculturalBatch | null> {
    const { data, error } = await supabase
      .from('agricultural_batches')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByBatchNumber(batchNumber: string): Promise<AgriculturalBatch | null> {
    const { data, error } = await supabase
      .from('agricultural_batches')
      .select('*')
      .eq('batch_number', batchNumber)
      .single();
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async create(input: BatchCreateInput): Promise<AgriculturalBatch> {
    const { data, error } = await supabase
      .from('agricultural_batches')
      .insert({
        batch_number: generateBatchNumber(),
        contract_id: input.contractId ?? null,
        farmer_id: input.farmerId,
        crop_type: input.cropType,
        variety_name: input.varietyName ?? null,
        quantity_kg: input.quantityKg,
        quality_grade: input.qualityGrade ?? null,
        harvest_date: input.harvestDate.toISOString(),
        origin_location: input.originLocation,
        destination_location: input.destinationLocation ?? null,
        status: BatchStatus.CREATED,
        metadata: input.metadata ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create batch: ${error.message}`);
    return this.mapToEntity(data);
  }

  async update(id: string, input: BatchUpdateInput): Promise<AgriculturalBatch> {
    const patch: Record<string, unknown> = {};
    if (input.status !== undefined) patch.status = input.status;
    if (input.qualityGrade !== undefined) patch.quality_grade = input.qualityGrade;
    if (input.destinationLocation !== undefined) patch.destination_location = input.destinationLocation;
    if (input.stellarTxId !== undefined) patch.stellar_tx_id = input.stellarTxId;
    if (input.metadata !== undefined) patch.metadata = input.metadata;

    const { data, error } = await supabase
      .from('agricultural_batches')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update batch: ${error.message}`);
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('agricultural_batches').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete batch: ${error.message}`);
  }

  async list(filters?: { farmerId?: string; contractId?: string; status?: BatchStatus; cropType?: string }): Promise<AgriculturalBatch[]> {
    let query = supabase.from('agricultural_batches').select('*').order('created_at', { ascending: false });
    if (filters?.farmerId) query = query.eq('farmer_id', filters.farmerId);
    if (filters?.contractId) query = query.eq('contract_id', filters.contractId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.cropType) query = query.ilike('crop_type', `%${filters.cropType}%`);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list batches: ${error.message}`);
    return (data ?? []).map(r => this.mapToEntity(r));
  }

  private mapToEntity(row: any): AgriculturalBatch {
    return {
      id: row.id,
      batchNumber: row.batch_number,
      contractId: row.contract_id,
      farmerId: row.farmer_id,
      cropType: row.crop_type,
      varietyName: row.variety_name,
      quantityKg: row.quantity_kg,
      qualityGrade: row.quality_grade,
      harvestDate: new Date(row.harvest_date),
      originLocation: row.origin_location,
      destinationLocation: row.destination_location,
      status: row.status,
      stellarTxId: row.stellar_tx_id,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
