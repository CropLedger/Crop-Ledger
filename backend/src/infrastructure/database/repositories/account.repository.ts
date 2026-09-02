import { supabase } from '../supabase-client.js';
import { Account, AccountCreateInput, AccountUpdateInput, AccountType } from '../../../domain/entities/account.entity.js';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface.js';

export class AccountRepository implements IAccountRepository {
  async findById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByStellarAddress(address: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('stellar_address', address)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async create(input: AccountCreateInput): Promise<Account> {
    const passwordHash = input.password; // Password should already be hashed
    const { password, ...accountData } = input;
    
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...accountData,
        password_hash: passwordHash,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create account: ${error.message}`);
    return this.mapToEntity(data);
  }

  async update(id: string, input: AccountUpdateInput): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update account: ${error.message}`);
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete account: ${error.message}`);
  }

  async list(filters?: { type?: string; organizationId?: string }): Promise<Account[]> {
    let query = supabase.from('accounts').select('*');
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(`Failed to list accounts: ${error.message}`);
    return data.map(a => this.mapToEntity(a));
  }

  async updateLastLogin(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw new Error(`Failed to update last login: ${error.message}`);
  }

  private mapToEntity(data: any): Account {
    return {
      id: data.id,
      organizationId: data.organization_id,
      email: data.email,
      passwordHash: data.password_hash,
      stellarAddress: data.stellar_address,
      type: data.type,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      isActive: data.is_active,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
