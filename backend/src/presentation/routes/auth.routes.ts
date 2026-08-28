import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();

  fastify.post('/register', controller.register.bind(controller));
  fastify.post('/login', controller.login.bind(controller));
  fastify.post('/refresh', controller.refreshToken.bind(controller));
  fastify.post('/logout', controller.logout.bind(controller));
}
