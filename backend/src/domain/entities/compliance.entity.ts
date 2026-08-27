export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  FLAGGED = 'FLAGGED',
}

export interface ComplianceReport {
  id: string;
  entityType: string;
  entityId: string;
  status: ComplianceStatus;
  violations: string[];
  lastAuditDate: Date;
  nextAuditDate: Date;
  auditorId: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
