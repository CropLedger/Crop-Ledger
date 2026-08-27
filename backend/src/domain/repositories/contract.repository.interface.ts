import { Contract, ContractCreateInput, ContractUpdateInput } from '../entities/contract.entity';

export interface IContractRepository {
  findById(id: string): Promise<Contract | null>;
  findByContractNumber(contractNumber: string): Promise<Contract | null>;
  create(input: ContractCreateInput): Promise<Contract>;
  update(id: string, input: ContractUpdateInput): Promise<Contract>;
  delete(id: string): Promise<void>;
  list(filters?: {
    buyerId?: string;
    sellerId?: string;
    status?: string;
  }): Promise<Contract[]>;
  findByBuyerOrSeller(accountId: string): Promise<Contract[]>;
}
