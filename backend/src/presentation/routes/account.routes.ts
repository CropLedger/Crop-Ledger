import { FastifyInstance } from 'fastify';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export async function accountRoutes(fastify: FastifyInstance) {
  const controller = new AccountController();

  fastify.get('/', { onRequest: [authMiddleware] }, controller.list.bind(controller));
  fastify.get('/me', { onRequest: [authMiddleware] }, controller.getProfile.bind(controller));
  fastify.patch('/me', { onRequest: [authMiddleware] }, controller.updateProfile.bind(controller));
}
