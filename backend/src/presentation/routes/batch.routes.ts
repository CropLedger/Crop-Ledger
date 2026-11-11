import { FastifyInstance } from 'fastify';
import { BatchController } from '../controllers/batch.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function batchRoutes(fastify: FastifyInstance) {
  const controller = new BatchController();

  fastify.get('/', { preHandler: [authMiddleware] }, controller.list.bind(controller));
  fastify.post('/', { preHandler: [authMiddleware] }, controller.create.bind(controller));
  fastify.get('/:id', { preHandler: [authMiddleware] }, controller.getById.bind(controller));
  fastify.get('/:id/events', { preHandler: [authMiddleware] }, controller.getEvents.bind(controller));
  fastify.post('/:id/events', { preHandler: [authMiddleware] }, controller.recordEvent.bind(controller));
}
