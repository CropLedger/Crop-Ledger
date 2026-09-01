import { FastifyInstance } from 'fastify';
import { ForecastController } from '../controllers/forecast.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function forecastRoutes(fastify: FastifyInstance) {
  const controller = new ForecastController();

  fastify.post('/generate', { onRequest: [authMiddleware] }, controller.generate);
  fastify.get('/historical', { onRequest: [authMiddleware] }, controller.getHistorical);
}
