import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAccountUseCase } from '../../domain/use-cases/account/create-account.use-case';
import { AccountRepository } from '../../infrastructure/database/repositories/account.repository';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-hasher';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  type: z.enum(['ENTERPRISE', 'COOPERATIVE', 'INSPECTOR']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  private createAccountUseCase: CreateAccountUseCase;

  constructor() {
    const accountRepository = new AccountRepository();
    const passwordHasher = new BcryptPasswordHasher();
    this.createAccountUseCase = new CreateAccountUseCase(accountRepository, passwordHasher);
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body);
      await this.createAccountUseCase.execute(data as any);
      
      reply.status(201).send({
        message: 'Account created successfully',
      });
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Registration failed',
      });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body);
      // TODO: Implement login logic with JWT
      reply.send({
        message: 'Login endpoint - implement JWT logic',
      });
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Login failed',
      });
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    reply.send({ message: 'Refresh token endpoint' });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.send({ message: 'Logout successful' });
  }
}
