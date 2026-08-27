import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateContractUseCase } from './create-contract.use-case';
import { IContractRepository } from '../../repositories/contract.repository.interface';
import { IStellarService } from '../../../infrastructure/blockchain/stellar.service.interface';

describe('CreateContractUseCase', () => {
  let useCase: CreateContractUseCase;
  let mockRepository: IContractRepository;
  let mockStellarService: IStellarService;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByContractNumber: vi.fn(),
      list: vi.fn(),
      findByBuyerOrSeller: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockStellarService = {
      createEscrow: vi.fn(),
      releaseEscrow: vi.fn(),
      refundEscrow: vi.fn(),
      getAccountBalance: vi.fn(),
      createPayment: vi.fn(),
    };

    useCase = new CreateContractUseCase(mockRepository, mockStellarService);
  });

  it('should create a contract with escrow', async () => {
    const input = {
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      cropType: 'Wheat',
      quantity: 100,
      unitPrice: 50,
      deliveryDate: new Date('2025-12-31'),
    };

    vi.mocked(mockStellarService.createEscrow).mockResolvedValue({
      transactionId: 'tx-123',
      escrowAddress: 'escrow-addr',
    });

    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 'contract-1',
      contractNumber: 'CTR-123',
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      cropType: input.cropType,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalPrice: 5000,
      escrowTxId: 'tx-123',
      escrowState: 'LOCKED' as any,
      status: 'PENDING' as any,
      deliveryDate: input.deliveryDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(input);

    expect(mockStellarService.createEscrow).toHaveBeenCalledWith({
      amount: 5000,
      assetCode: 'XLM',
      buyerId: input.buyerId,
      sellerId: input.sellerId,
    });
    expect(mockRepository.create).toHaveBeenCalled();
    expect(result).toBe('contract-1');
  });
});
