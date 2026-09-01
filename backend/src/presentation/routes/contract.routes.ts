import { FastifyInstance } from 'fastify';
import { ContractController } from '../controllers/contract.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function contractRoutes(fastify: FastifyInstance) {
  const controller = new ContractController();

  fastify.get('/', { onRequest: [authMiddleware] }, controller.list.bind(controller));
  fastify.get('/:id', { onRequest: [authMiddleware] }, controller.getById.bind(controller));
  fastify.post('/', { onRequest: [authMiddleware] }, controller.create.bind(controller));
  fastify.patch('/:id', { onRequest: [authMiddleware] }, controller.update.bind(controller));
  fastify.delete('/:id', { onRequest: [authMiddleware] }, controller.delete.bind(controller));
}
