import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateContractUseCase } from '../../domain/use-cases/contract/create-contract.use-case';
import { ContractRepository } from '../../infrastructure/database/repositories/contract.repository';
import { StellarService } from '../../infrastructure/blockchain/stellar.service';
import { z } from 'zod';

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

  constructor() {
    const contractRepository = new ContractRepository();
    const stellarService = new StellarService();
    this.createContractUseCase = new CreateContractUseCase(contractRepository, stellarService);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    reply.send({ message: 'List contracts endpoint' });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    reply.send({ message: `Get contract ${id}` });
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
    reply.send({ message: `Update contract ${id}` });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    reply.send({ message: `Delete contract ${id}` });
  }
}
