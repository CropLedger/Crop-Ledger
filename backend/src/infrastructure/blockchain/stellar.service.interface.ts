export interface IStellarService {
  createEscrow(params: {
    amount: number;
    assetCode: string;
    buyerId: string;
    sellerId: string;
  }): Promise<{ transactionId: string; escrowAddress: string }>;
  releaseEscrow(escrowAddress: string, recipientId: string): Promise<string>;
  refundEscrow(escrowAddress: string, buyerId: string): Promise<string>;
  getAccountBalance(address: string): Promise<{ balance: string; assetCode: string }>;
  createPayment(params: {
    from: string;
    to: string;
    amount: string;
    assetCode: string;
    secretKey: string;
  }): Promise<string>;
}
