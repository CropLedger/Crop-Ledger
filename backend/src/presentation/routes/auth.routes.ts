import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();

  fastify.post('/register', controller.register);
  fastify.post('/login', controller.login);
  fastify.post('/refresh', controller.refreshToken);
  fastify.post('/logout', controller.logout);
}
