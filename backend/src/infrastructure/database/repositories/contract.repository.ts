import { prisma } from '../prisma-client';
import { Contract, ContractCreateInput, ContractUpdateInput, TransactionStatus, EscrowState } from '../../../domain/entities/contract.entity';
import { IContractRepository } from '../../../domain/repositories/contract.repository.interface';

export class ContractRepository implements IContractRepository {
  async findById(id: string): Promise<Contract | null> {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { buyer: true, seller: true },
    });
    return contract ? this.mapToEntity(contract) : null;
  }

  async findByContractNumber(contractNumber: string): Promise<Contract | null> {
    const contract = await prisma.contract.findUnique({
      where: { contractNumber },
      include: { buyer: true, seller: true },
    });
    return contract ? this.mapToEntity(contract) : null;
  }

  async create(input: ContractCreateInput): Promise<Contract> {
    const contract = await prisma.contract.create({
      data: {
        buyerId: input.buyerId,
        sellerId: input.sellerId,
        cropType: input.cropType,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        totalPrice: (input as any).totalPrice,
        contractNumber: (input as any).contractNumber,
        escrowTxId: (input as any).escrowTxId,
        escrowState: (input as any).escrowState as any,
        status: (input as any).status as any,
        deliveryDate: input.deliveryDate,
        deliveryLocation: input.deliveryLocation,
        metadata: input.metadata as any,
      },
      include: { buyer: true, seller: true },
    });
    return this.mapToEntity(contract);
  }

  async update(id: string, input: ContractUpdateInput): Promise<Contract> {
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        status: input.status as any,
        escrowState: input.escrowState as any,
        escrowTxId: input.escrowTxId,
        deliveryLocation: input.deliveryLocation,
        metadata: input.metadata as any,
      },
      include: { buyer: true, seller: true },
    });
    return this.mapToEntity(contract);
  }

  async delete(id: string): Promise<void> {
    await prisma.contract.delete({ where: { id } });
  }

  async list(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<Contract[]> {
    const contracts = await prisma.contract.findMany({
      where: {
        buyerId: filters?.buyerId,
        sellerId: filters?.sellerId,
        status: filters?.status as any,
      },
      include: { buyer: true, seller: true },
    });
    return contracts.map((c: any) => this.mapToEntity(c));
  }

  async findByBuyerOrSeller(accountId: string): Promise<Contract[]> {
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { buyerId: accountId },
          { sellerId: accountId },
        ],
      },
      include: { buyer: true, seller: true },
    });
    return contracts.map((c: any) => this.mapToEntity(c));
  }

  private mapToEntity(data: any): Contract {
    return {
      id: data.id,
      contractNumber: data.contractNumber,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      cropType: data.cropType,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      escrowTxId: data.escrowTxId,
      escrowState: data.escrowState as EscrowState,
      status: data.status as TransactionStatus,
      deliveryDate: data.deliveryDate,
      deliveryLocation: data.deliveryLocation,
      metadata: data.metadata as Record<string, unknown>,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
