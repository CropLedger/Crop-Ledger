export interface AccountCredentials {
  id: string;
  email: string;
  type: string;
  passwordHash: string;
  isActive: boolean;
}

export interface IAuthRepository {
  findCredentialsByEmail(email: string): Promise<AccountCredentials | null>;
  findIdByRefreshToken(refreshToken: string): Promise<string | null>;
  setRefreshToken(accountId: string, refreshToken: string | null): Promise<void>;
}
