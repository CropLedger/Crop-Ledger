import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AgriculturalBatchRepository } from '../../infrastructure/database/repositories/agricultural-batch.repository.js';
import { TraceabilityEventRepository } from '../../infrastructure/database/repositories/traceability-event.repository.js';
import { CreateBatchUseCase } from '../../domain/use-cases/batch/create-batch.use-case.js';
import { RecordEventUseCase } from '../../domain/use-cases/batch/record-event.use-case.js';
import { EventType } from '../../domain/entities/traceability-event.entity.js';

const createBatchSchema = z.object({
  contractId: z.string().optional(),
  farmerId: z.string(),
  cropType: z.string(),
  varietyName: z.string().optional(),
  quantityKg: z.number().positive(),
  qualityGrade: z.string().optional(),
  harvestDate: z.string().transform(v => new Date(v)),
  originLocation: z.string(),
  destinationLocation: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const recordEventSchema = z.object({
  eventType: z.nativeEnum(EventType),
  actorId: z.string(),
  location: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export class BatchController {
  private createBatchUseCase: CreateBatchUseCase;
  private recordEventUseCase: RecordEventUseCase;
  private batchRepository: AgriculturalBatchRepository;

  constructor() {
    this.batchRepository = new AgriculturalBatchRepository();
    const eventRepository = new TraceabilityEventRepository();
    this.createBatchUseCase = new CreateBatchUseCase(this.batchRepository);
    this.recordEventUseCase = new RecordEventUseCase(eventRepository, this.batchRepository);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { farmerId, contractId, status, cropType } = request.query as any;
      const batches = await this.batchRepository.list({ farmerId, contractId, status, cropType });
      reply.send({ batches });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to list batches' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const batch = await this.batchRepository.findById(id);
      if (!batch) return reply.status(404).send({ error: 'Batch not found' });
      reply.send({ batch });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to fetch batch' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createBatchSchema.parse(request.body);
      const batch = await this.createBatchUseCase.execute(data);
      reply.status(201).send({ batch });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to create batch' });
    }
  }

  async getEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const eventRepo = new TraceabilityEventRepository();
      const events = await eventRepo.listByBatch(id);
      reply.send({ events });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to fetch events' });
    }
  }

  async recordEvent(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = recordEventSchema.parse(request.body);
      const event = await this.recordEventUseCase.execute({ ...data, batchId: id });
      reply.status(201).send({ event });
    } catch (error: any) {
      reply.status(400).send({ error: error.message || 'Failed to record event' });
    }
  }
}
