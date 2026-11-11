import {
  Horizon,
  TransactionBuilder,
  Asset,
  Operation,
  Networks,
  Keypair,
  BASE_FEE,
  Claimant,
} from '@stellar/stellar-sdk';
import { IStellarService } from './stellar.service.interface.js';

export class StellarService implements IStellarService {
  private readonly horizonUrl: string;
  private readonly server: Horizon.Server;
  private readonly networkPassphrase: string;

  constructor() {
    this.horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
    this.server = new Horizon.Server(this.horizonUrl);
    this.networkPassphrase =
      process.env.STELLAR_NETWORK === 'MAINNET' ? Networks.PUBLIC : Networks.TESTNET;
  }

  /**
   * Creates a Claimable Balance on Stellar that acts as escrow:
   * the seller can claim it after delivery, the buyer can reclaim
   * it before the delivery date if the contract is cancelled.
   *
   * Requires STELLAR_SECRET_KEY to be set — the issuer/platform account
   * that funds and signs the escrow transaction.
   */
  async createEscrow(params: {
    amount: number;
    assetCode: string;
    buyerId: string;
    sellerId: string;
  }): Promise<{ transactionId: string; escrowAddress: string }> {
    const secretKey = process.env.STELLAR_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'STELLAR_SECRET_KEY is required to create an escrow. ' +
        'Set it in your .env to a funded Stellar Testnet keypair.',
      );
    }

    const sourceKeypair = Keypair.fromSecret(secretKey);
    const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());

    const asset = params.assetCode === 'XLM' ? Asset.native() : new Asset(params.assetCode, sourceKeypair.publicKey());

    // Seller can unconditionally claim; buyer can reclaim (refund path)
    const claimants = [
      new Claimant(params.sellerId, Claimant.predicateUnconditional()),
      new Claimant(params.buyerId, Claimant.predicateUnconditional()),
    ];

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.createClaimableBalance({
          asset,
          amount: params.amount.toFixed(7),
          claimants,
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await this.server.submitTransaction(transaction);

    // The claimable balance ID is returned in the result's balanceID
    const balanceId: string = (result as any).balance_id ?? result.hash;

    return {
      transactionId: result.hash,
      escrowAddress: balanceId,
    };
  }

  /**
   * Claims a Claimable Balance on behalf of the recipient (seller after delivery).
   * The recipient must sign — their secret key is passed as recipientSecretKey.
   */
  async releaseEscrow(escrowBalanceId: string, recipientSecretKey: string): Promise<string> {
    if (!recipientSecretKey) {
      throw new Error('recipientSecretKey is required to claim (release) the escrow balance.');
    }

    const recipientKeypair = Keypair.fromSecret(recipientSecretKey);
    const recipientAccount = await this.server.loadAccount(recipientKeypair.publicKey());

    const transaction = new TransactionBuilder(recipientAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.claimClaimableBalance({ balanceId: escrowBalanceId }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(recipientKeypair);
    const result = await this.server.submitTransaction(transaction);
    return result.hash;
  }

  /**
   * Refunds the escrow back to the buyer by claiming the balance with
   * the buyer's key.
   */
  async refundEscrow(escrowBalanceId: string, buyerSecretKey: string): Promise<string> {
    if (!buyerSecretKey) {
      throw new Error('buyerSecretKey is required to reclaim (refund) the escrow balance.');
    }

    const buyerKeypair = Keypair.fromSecret(buyerSecretKey);
    const buyerAccount = await this.server.loadAccount(buyerKeypair.publicKey());

    const transaction = new TransactionBuilder(buyerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.claimClaimableBalance({ balanceId: escrowBalanceId }),
      )
      .setTimeout(30)
      .build();

    buyerKeypair && transaction.sign(buyerKeypair);
    const result = await this.server.submitTransaction(transaction);
    return result.hash;
  }

  async getAccountBalance(address: string): Promise<{ balance: string; assetCode: string }> {
    try {
      const account = await this.server.loadAccount(address);
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      if (nativeBalance) {
        return { balance: nativeBalance.balance, assetCode: 'XLM' };
      }
      const firstBalance = account.balances[0];
      const assetCode = 'asset_code' in firstBalance ? firstBalance.asset_code : 'UNKNOWN';
      return { balance: firstBalance.balance, assetCode };
    } catch (error) {
      throw new Error(`Failed to fetch account balance: ${error}`);
    }
  }

  /**
   * Sends a payment on Stellar. The source account signs with secretKey.
   */
  async createPayment(params: {
    from: string;
    to: string;
    amount: string;
    assetCode: string;
    secretKey: string;
  }): Promise<string> {
    if (!params.secretKey) {
      throw new Error('secretKey is required to submit a payment transaction.');
    }

    const sourceKeypair = Keypair.fromSecret(params.secretKey);
    const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());

    const asset = params.assetCode === 'XLM'
      ? Asset.native()
      : new Asset(params.assetCode, sourceKeypair.publicKey());

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: params.to,
          asset,
          amount: params.amount,
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await this.server.submitTransaction(transaction);
    return result.hash;
  }
}
