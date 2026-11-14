import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateContractUseCase } from '../../domain/use-cases/contract/create-contract.use-case.js';
import { ContractRepository } from '../../infrastructure/database/repositories/contract.repository.js';
import { StellarService } from '../../infrastructure/blockchain/stellar.service.js';
import { z } from 'zod';
import { TransactionStatus } from '../../domain/entities/contract.entity.js';

const createContractSchema = z.object({
  buyerId: z.string(),
  sellerId: z.string(),
  cropType: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  deliveryDate: z.string().transform((val) => new Date(val)),
  deliveryLocation: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export class ContractController {
  private createContractUseCase: CreateContractUseCase;
  private contractRepository: ContractRepository;

  constructor() {
    const contractRepository = new ContractRepository();
    const stellarService = new StellarService();
    this.contractRepository = contractRepository;
    this.createContractUseCase = new CreateContractUseCase(contractRepository, stellarService);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contracts = await this.contractRepository.list();
      reply.send({ contracts });
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Failed to fetch contracts',
      });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const contract = await this.contractRepository.findById(id);
      if (!contract) {
        return reply.status(404).send({ error: 'Contract not found' });
      }
      reply.send({ contract });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to fetch contract' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createContractSchema.parse(request.body);
      const contractId = await this.createContractUseCase.execute(data);
      
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
    const { id } = request.params as { id: string };
    try {
      const updateSchema = z.object({
        status: z.nativeEnum(TransactionStatus).optional(),
        escrowState: z.enum(['LOCKED', 'RELEASED', 'REFUNDED']).optional(),
        escrowTxId: z.string().optional(),
      });
      const data = updateSchema.parse(request.body);
      const contract = await this.contractRepository.update(id, data);
      reply.send({ contract });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to update contract' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await this.contractRepository.delete(id);
      reply.status(204).send();
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to delete contract' });
    }
  }
}
