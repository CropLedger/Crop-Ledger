import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateContractUseCase } from '../../domain/use-cases/contract/create-contract.use-case';
import { ContractRepository } from '../../infrastructure/database/repositories/contract.repository';
import { StellarService } from '../../infrastructure/blockchain/stellar.service';
import { Contract, EscrowState, TransactionStatus } from '../../domain/entities/contract.entity';
import { z } from 'zod';

const createContractSchema = z.object({
  buyerId: z.string().optional(),
  sellerId: z.string(),
  cropType: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  deliveryDate: z.string().transform((val) => new Date(val)),
  deliveryLocation: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateContractSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  escrowState: z.nativeEnum(EscrowState).optional(),
  deliveryLocation: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const listQuerySchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
});

export class ContractController {
  private createContractUseCase: CreateContractUseCase;
  private contractRepository: ContractRepository;
  private stellarService: StellarService;

  constructor() {
    this.contractRepository = new ContractRepository();
    this.stellarService = new StellarService();
    this.createContractUseCase = new CreateContractUseCase(this.contractRepository, this.stellarService);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status } = listQuerySchema.parse(request.query);
      const contracts = await this.contractRepository.findByBuyerOrSeller(request.user.sub);
      const filtered = status ? contracts.filter((contract) => contract.status === status) : contracts;

      reply.send({
        contracts: filtered,
        stats: this.buildStats(contracts),
      });
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Failed to list contracts',
      });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const contract = await this.contractRepository.findById(id);

    if (!contract) {
      reply.status(404).send({ error: 'Contract not found' });
      return;
    }
    if (!this.isParty(contract, request.user.sub)) {
      reply.status(403).send({ error: 'You are not a party to this contract' });
      return;
    }

    reply.send(contract);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createContractSchema.parse(request.body);
      const contractId = await this.createContractUseCase.execute({
        ...data,
        buyerId: data.buyerId || request.user.sub,
      });

      reply.status(201).send({
        message: 'Contract created successfully',
        contractId,
      });
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Contract creation failed',
      });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = updateContractSchema.parse(request.body);
      const contract = await this.contractRepository.findById(id);

      if (!contract) {
        reply.status(404).send({ error: 'Contract not found' });
        return;
      }
      if (!this.isParty(contract, request.user.sub)) {
        reply.status(403).send({ error: 'You are not a party to this contract' });
        return;
      }

      const escrowTxId = await this.settleEscrow(contract, data.escrowState);
      const updated = await this.contractRepository.update(id, { ...data, escrowTxId });

      reply.send(updated);
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Contract update failed',
      });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const contract = await this.contractRepository.findById(id);

    if (!contract) {
      reply.status(404).send({ error: 'Contract not found' });
      return;
    }
    if (!this.isParty(contract, request.user.sub)) {
      reply.status(403).send({ error: 'You are not a party to this contract' });
      return;
    }

    await this.contractRepository.delete(id);
    reply.status(204).send();
  }

  private isParty(contract: Contract, accountId: string): boolean {
    return contract.buyerId === accountId || contract.sellerId === accountId;
  }

  private async settleEscrow(contract: Contract, escrowState?: EscrowState): Promise<string | undefined> {
    if (!escrowState || escrowState === contract.escrowState || contract.escrowState !== EscrowState.LOCKED) {
      return contract.escrowTxId;
    }

    if (escrowState === EscrowState.RELEASED) {
      return this.stellarService.releaseEscrow(contract.escrowTxId || contract.id, contract.sellerId);
    }
    if (escrowState === EscrowState.REFUNDED) {
      return this.stellarService.refundEscrow(contract.escrowTxId || contract.id, contract.buyerId);
    }

    return contract.escrowTxId;
  }

  private buildStats(contracts: Contract[]) {
    return {
      totalContracts: contracts.length,
      totalValue: contracts.reduce((sum, contract) => sum + contract.totalPrice, 0),
      pendingContracts: contracts.filter((c) => c.status === TransactionStatus.PENDING).length,
      completedContracts: contracts.filter((c) => c.status === TransactionStatus.COMPLETED).length,
    };
  }
}
