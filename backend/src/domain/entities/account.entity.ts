export enum AccountType {
  ENTERPRISE = 'ENTERPRISE',
  COOPERATIVE = 'COOPERATIVE',
  INSPECTOR = 'INSPECTOR',
  ADMIN = 'ADMIN',
}

export interface Account {
  id: string;
  organizationId?: string;
  email: string;
  stellarAddress?: string;
  type: AccountType;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountCreateInput {
  email: string;
  password: string;
  type: AccountType;
  organizationId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AccountUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  stellarAddress?: string;
}
