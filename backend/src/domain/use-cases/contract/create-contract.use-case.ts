import { IContractRepository } from '../../repositories/contract.repository.interface.js';
import { IStellarService } from '../../../infrastructure/blockchain/stellar.service.interface.js';
import { ContractCreateInput, TransactionStatus, EscrowState } from '../../entities/contract.entity.js';

export class CreateContractUseCase {
  constructor(
    private contractRepository: IContractRepository,
    private stellarService: IStellarService,
  ) {}

  async execute(input: ContractCreateInput): Promise<string> {
    // Calculate total price
    const totalPrice = input.quantity * input.unitPrice;
    
    // Create escrow on Stellar
    const escrowResult = await this.stellarService.createEscrow({
      amount: totalPrice,
      assetCode: 'XLM',
      buyerId: input.buyerId,
      sellerId: input.sellerId,
    });

    // Generate contract number
    const contractNumber = `CTR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create contract in database
    const contract = await this.contractRepository.create({
      ...input,
      totalPrice,
      contractNumber,
      escrowTxId: escrowResult.transactionId,
      escrowState: EscrowState.LOCKED,
      status: TransactionStatus.PENDING,
    });

    return contract.id;
  }
}
