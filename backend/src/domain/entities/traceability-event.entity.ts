export enum EventType {
  HARVEST = 'HARVEST',
  QUALITY_CHECK = 'QUALITY_CHECK',
  STORAGE = 'STORAGE',
  TRANSPORT_START = 'TRANSPORT_START',
  TRANSPORT_END = 'TRANSPORT_END',
  CUSTOMS = 'CUSTOMS',
  DELIVERY = 'DELIVERY',
  REJECTION = 'REJECTION',
}

export interface TraceabilityEvent {
  id: string;
  batchId: string;
  eventType: EventType;
  actorId: string;
  location?: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
  stellarTxId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface TraceabilityEventCreateInput {
  batchId: string;
  eventType: EventType;
  actorId: string;
  location?: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}
