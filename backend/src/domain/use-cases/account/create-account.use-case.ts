import { IAccountRepository } from '../../repositories/account.repository.interface';
import { IPasswordHasher } from '../../../infrastructure/security/password-hasher.interface';
import { Account, AccountCreateInput } from '../../entities/account.entity';

export class CreateAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: AccountCreateInput): Promise<Account> {
    const existingAccount = await this.accountRepository.findByEmail(input.email);
    if (existingAccount) {
      throw new Error('Account with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);
    
    return this.accountRepository.create({
      ...input,
      password: hashedPassword,
    });
  }
}
