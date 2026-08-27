import { Account, AccountCreateInput, AccountUpdateInput } from '../entities/account.entity';

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  findByStellarAddress(address: string): Promise<Account | null>;
  create(input: AccountCreateInput): Promise<Account>;
  update(id: string, input: AccountUpdateInput): Promise<Account>;
  delete(id: string): Promise<void>;
  list(filters?: { type?: string; organizationId?: string }): Promise<Account[]>;
  updateLastLogin(id: string): Promise<void>;
}
