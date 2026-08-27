import { prisma } from '../prisma-client';
import { Account, AccountCreateInput, AccountUpdateInput, AccountType } from '../../../domain/entities/account.entity';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';

export class AccountRepository implements IAccountRepository {
  async findById(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
      include: { organization: true },
    });
    return account ? this.mapToEntity(account) : null;
  }

  async findByEmail(email: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { email },
      include: { organization: true },
    });
    return account ? this.mapToEntity(account) : null;
  }

  async findByStellarAddress(address: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { stellarAddress: address },
      include: { organization: true },
    });
    return account ? this.mapToEntity(account) : null;
  }

  async create(input: AccountCreateInput): Promise<Account> {
    const account = await prisma.account.create({
      data: {
        email: input.email,
        passwordHash: (input as any).password,
        type: input.type as any,
        organizationId: input.organizationId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      include: { organization: true },
    });
    return this.mapToEntity(account);
  }

  async update(id: string, input: AccountUpdateInput): Promise<Account> {
    const account = await prisma.account.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
        stellarAddress: input.stellarAddress,
      },
      include: { organization: true },
    });
    return this.mapToEntity(account);
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({ where: { id } });
  }

  async list(filters?: { type?: string; organizationId?: string }): Promise<Account[]> {
    const accounts = await prisma.account.findMany({
      where: {
        type: filters?.type as any,
        organizationId: filters?.organizationId,
      },
      include: { organization: true },
    });
    return accounts.map((a: any) => this.mapToEntity(a));
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.account.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  private mapToEntity(data: any): Account {
    return {
      id: data.id,
      organizationId: data.organizationId,
      email: data.email,
      stellarAddress: data.stellarAddress,
      type: data.type as AccountType,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      lastLoginAt: data.lastLoginAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
