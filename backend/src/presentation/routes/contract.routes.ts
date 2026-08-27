import { FastifyInstance } from 'fastify';
import { ContractController } from '../controllers/contract.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export async function contractRoutes(fastify: FastifyInstance) {
  const controller = new ContractController();

  fastify.get('/', { onRequest: [authMiddleware] }, controller.list);
  fastify.get('/:id', { onRequest: [authMiddleware] }, controller.getById);
  fastify.post('/', { onRequest: [authMiddleware] }, controller.create);
  fastify.patch('/:id', { onRequest: [authMiddleware] }, controller.update);
  fastify.delete('/:id', { onRequest: [authMiddleware] }, controller.delete);
}
