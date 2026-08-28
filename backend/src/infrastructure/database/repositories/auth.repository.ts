import { prisma } from '../prisma-client';
import { AccountCredentials, IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

export class AuthRepository implements IAuthRepository {
  async findCredentialsByEmail(email: string): Promise<AccountCredentials | null> {
    const account = await prisma.account.findUnique({
      where: { email },
      select: { id: true, email: true, type: true, passwordHash: true, isActive: true },
    });
    return account;
  }

  async findIdByRefreshToken(refreshToken: string): Promise<string | null> {
    const account = await prisma.account.findUnique({
      where: { refreshToken },
      select: { id: true },
    });
    return account?.id ?? null;
  }

  async setRefreshToken(accountId: string, refreshToken: string | null): Promise<void> {
    await prisma.account.update({
      where: { id: accountId },
      data: { refreshToken },
    });
  }
}
