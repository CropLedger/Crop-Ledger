import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case';
import { IAccountRepository } from '../../repositories/account.repository.interface';
import { IPasswordHasher } from '../../../infrastructure/security/password-hasher.interface';

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase;
  let mockRepository: IAccountRepository;
  let mockHasher: IPasswordHasher;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findByStellarAddress: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateLastLogin: vi.fn(),
    };

    mockHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    useCase = new CreateAccountUseCase(mockRepository, mockHasher);
  });

  it('should create an account with hashed password', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      type: 'ENTERPRISE' as any,
      firstName: 'John',
      lastName: 'Doe',
    };

    vi.mocked(mockHasher.hash).mockResolvedValue('hashed_password');
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: '1',
      email: input.email,
      type: input.type as any,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await useCase.execute(input);

    expect(mockHasher.hash).toHaveBeenCalledWith(input.password);
    expect(mockRepository.create).toHaveBeenCalledWith({
      ...input,
      password: 'hashed_password',
    });
  });

  it('should throw error if email already exists', async () => {
    const input = {
      email: 'existing@example.com',
      password: 'password123',
      type: 'ENTERPRISE' as any,
    };

    vi.mocked(mockRepository.findByEmail).mockResolvedValue({
      id: '1',
      email: input.email,
      type: input.type as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute(input)).rejects.toThrow('Account with this email already exists');
  });
});
