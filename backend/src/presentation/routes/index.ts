import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { contractRoutes } from './contract.routes.js';
import { accountRoutes } from './account.routes.js';
import { forecastRoutes } from './forecast.routes.js';
import { healthRoutes } from './health.routes.js';

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(contractRoutes, { prefix: '/api/v1/contracts' });
  await fastify.register(accountRoutes, { prefix: '/api/v1/accounts' });
  await fastify.register(forecastRoutes, { prefix: '/api/v1/forecast' });
  await fastify.register(healthRoutes, { prefix: '/health' });
}
