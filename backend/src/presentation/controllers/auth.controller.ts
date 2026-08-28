import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAccountUseCase } from '../../domain/use-cases/account/create-account.use-case';
import { AccountRepository } from '../../infrastructure/database/repositories/account.repository';
import { AuthRepository } from '../../infrastructure/database/repositories/auth.repository';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-hasher';
import { AccountType } from '../../domain/entities/account.entity';
import { AccessTokenPayload } from '../types/jwt';
import { z } from 'zod';

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

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

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export class AuthController {
  private createAccountUseCase: CreateAccountUseCase;
  private accountRepository: AccountRepository;
  private authRepository: AuthRepository;
  private passwordHasher: BcryptPasswordHasher;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.authRepository = new AuthRepository();
    this.passwordHasher = new BcryptPasswordHasher();
    this.createAccountUseCase = new CreateAccountUseCase(this.accountRepository, this.passwordHasher);
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerSchema.parse(request.body);
      const account = await this.createAccountUseCase.execute({
        ...data,
        type: data.type as AccountType,
      });

      reply.status(201).send({
        message: 'Account created successfully',
        user: account,
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
      const credentials = await this.authRepository.findCredentialsByEmail(data.email);

      if (!credentials || !credentials.isActive) {
        reply.status(401).send({ error: 'Invalid email or password' });
        return;
      }

      const passwordMatches = await this.passwordHasher.verify(data.password, credentials.passwordHash);
      if (!passwordMatches) {
        reply.status(401).send({ error: 'Invalid email or password' });
        return;
      }

      const tokens = this.issueTokens(request, {
        sub: credentials.id,
        email: credentials.email,
        type: credentials.type,
      });

      await this.authRepository.setRefreshToken(credentials.id, tokens.refreshToken);
      await this.accountRepository.updateLastLogin(credentials.id);

      const user = await this.accountRepository.findById(credentials.id);

      reply.send({ ...tokens, user });
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Login failed',
      });
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = refreshSchema.parse(request.body);

      let payload: AccessTokenPayload;
      try {
        payload = request.server.jwt.verify<AccessTokenPayload>(refreshToken);
      } catch {
        reply.status(401).send({ error: 'Invalid or expired refresh token' });
        return;
      }

      const accountId = await this.authRepository.findIdByRefreshToken(refreshToken);
      if (!accountId || accountId !== payload.sub) {
        reply.status(401).send({ error: 'Refresh token is no longer valid' });
        return;
      }

      const tokens = this.issueTokens(request, {
        sub: payload.sub,
        email: payload.email,
        type: payload.type,
      });
      await this.authRepository.setRefreshToken(accountId, tokens.refreshToken);

      reply.send(tokens);
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Token refresh failed',
      });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      await this.authRepository.setRefreshToken(request.user.sub, null);
    } catch {
      // Logging out without a valid token is a no-op.
    }

    reply.send({ message: 'Logout successful' });
  }

  private issueTokens(request: FastifyRequest, payload: AccessTokenPayload) {
    return {
      token: request.server.jwt.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
      refreshToken: request.server.jwt.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
    };
  }
}
