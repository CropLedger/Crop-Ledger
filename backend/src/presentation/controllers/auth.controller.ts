import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAccountUseCase } from '../../domain/use-cases/account/create-account.use-case.js';
import { AccountRepository } from '../../infrastructure/database/repositories/account.repository.js';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-hasher.js';
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
  private accountRepository: AccountRepository;
  private passwordHasher: BcryptPasswordHasher;

  constructor() {
    try {
      this.accountRepository = new AccountRepository();
      this.passwordHasher = new BcryptPasswordHasher();
      this.createAccountUseCase = new CreateAccountUseCase(this.accountRepository, this.passwordHasher);
    } catch (error) {
      console.error('Failed to initialize AuthController:', error);
      throw error;
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('Register request received:', request.body);
      console.log('Use case initialized:', !!this.createAccountUseCase);
      
      if (!this.createAccountUseCase) {
        throw new Error('CreateAccountUseCase not initialized');
      }
      
      const data = registerSchema.parse(request.body);
      console.log('Data validated:', data);
      
      await this.createAccountUseCase.execute(data as any);
      
      reply.status(201).send({
        message: 'Account created successfully',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      reply.status(400).send({
        error: error.message || 'Registration failed',
      });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body);
      
      const account = await this.accountRepository.findByEmail(data.email);
      if (!account) {
        reply.status(401).send({
          error: 'Invalid credentials',
        });
        return;
      }

      const isValidPassword = await this.passwordHasher.verify(data.password, account.passwordHash as string);
      if (!isValidPassword) {
        reply.status(401).send({
          error: 'Invalid credentials',
        });
        return;
      }

      const token = request.server.jwt.sign({
        sub: account.id,
        email: account.email,
        type: account.type,
      });

      await this.accountRepository.updateLastLogin(account.id);

      reply.send({
        token,
        user: {
          id: account.id,
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          type: account.type,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
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
