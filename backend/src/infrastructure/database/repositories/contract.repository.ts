import { supabase } from '../supabase-client.js';
import { Contract, ContractCreateInput, ContractUpdateInput, TransactionStatus, EscrowState } from '../../../domain/entities/contract.entity.js';
import { IContractRepository } from '../../../domain/repositories/contract.repository.interface.js';

export class ContractRepository implements IContractRepository {
  async findById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByContractNumber(contractNumber: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('contract_number', contractNumber)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async create(input: ContractCreateInput): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        organization_id: input.organizationId,
        contract_number: input.contractNumber,
        buyer_id: input.buyerId,
        seller_id: input.sellerId,
        crop_type: input.cropType,
        quantity: input.quantity,
        unit_price: input.unitPrice,
        total_price: input.totalPrice,
        escrow_tx_id: input.escrowTxId,
        escrow_state: input.escrowState || 'LOCKED',
        status: input.status || 'PENDING',
        delivery_date: input.deliveryDate,
        delivery_location: input.deliveryLocation,
        metadata: input.metadata,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create contract: ${error.message}`);
    return this.mapToEntity(data);
  }

  async update(id: string, input: ContractUpdateInput): Promise<Contract> {
    const updateData: any = {};
    if (input.escrowTxId !== undefined) updateData.escrow_tx_id = input.escrowTxId;
    if (input.escrowState !== undefined) updateData.escrow_state = input.escrowState;
    if (input.status !== undefined) updateData.status = input.status;
    
    const { data, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update contract: ${error.message}`);
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete contract: ${error.message}`);
  }

  async list(filters?: {
    buyerId?: string;
    sellerId?: string;
    status?: TransactionStatus;
    organizationId?: string;
  }): Promise<Contract[]> {
    let query = supabase.from('contracts').select('*');
    
    if (filters?.buyerId) query = query.eq('buyer_id', filters.buyerId);
    if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.organizationId) query = query.eq('organization_id', filters.organizationId);

    const { data, error } = await query;
    
    if (error) throw new Error(`Failed to list contracts: ${error.message}`);
    return data.map(c => this.mapToEntity(c));
  }

  private mapToEntity(data: any): Contract {
    return {
      id: data.id,
      organizationId: data.organization_id,
      contractNumber: data.contract_number,
      buyerId: data.buyer_id,
      sellerId: data.seller_id,
      cropType: data.crop_type,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
      escrowTxId: data.escrow_tx_id,
      escrowState: data.escrow_state,
      status: data.status,
      deliveryDate: new Date(data.delivery_date),
      deliveryLocation: data.delivery_location,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
