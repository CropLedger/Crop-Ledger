import { FastifyRequest, FastifyReply } from 'fastify';
import { AccountRepository } from '../../infrastructure/database/repositories/account.repository';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  stellarAddress: z.string().optional(),
});

const listQuerySchema = z.object({
  type: z.enum(['ENTERPRISE', 'COOPERATIVE', 'INSPECTOR', 'ADMIN']).optional(),
  organizationId: z.string().optional(),
});

export class AccountController {
  private accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const account = await this.accountRepository.findById(request.user.sub);

    if (!account) {
      reply.status(404).send({ error: 'Account not found' });
      return;
    }

    reply.send(account);
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = updateProfileSchema.parse(request.body);
      const account = await this.accountRepository.update(request.user.sub, data);

      reply.send(account);
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Profile update failed',
      });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = listQuerySchema.parse(request.query);
      const accounts = await this.accountRepository.list(filters);

      reply.send(accounts);
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Failed to list accounts',
      });
    }
  }
}
