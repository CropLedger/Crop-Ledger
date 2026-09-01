import { Organization, OrganizationCreateInput, OrganizationUpdateInput } from '../entities/organization.entity.js';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByEmail(email: string): Promise<Organization | null>;
  findByDomain(domain: string): Promise<Organization | null>;
  create(input: OrganizationCreateInput): Promise<Organization>;
  update(id: string, input: OrganizationUpdateInput): Promise<Organization>;
  delete(id: string): Promise<void>;
  list(filters?: { isActive?: boolean }): Promise<Organization[]>;
}
