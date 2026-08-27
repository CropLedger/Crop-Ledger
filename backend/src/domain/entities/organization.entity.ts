export interface Organization {
  id: string;
  name: string;
  email: string;
  domain?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationCreateInput {
  name: string;
  email: string;
  domain?: string;
  logoUrl?: string;
}

export interface OrganizationUpdateInput {
  name?: string;
  domain?: string;
  logoUrl?: string;
  isActive?: boolean;
}
