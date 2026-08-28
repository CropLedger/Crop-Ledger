import { FastifyInstance } from 'fastify';
import { ForecastController } from '../controllers/forecast.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export async function forecastRoutes(fastify: FastifyInstance) {
  const controller = new ForecastController();

  fastify.post('/generate', { onRequest: [authMiddleware] }, controller.generate.bind(controller));
  fastify.get('/historical', { onRequest: [authMiddleware] }, controller.getHistorical.bind(controller));
}
