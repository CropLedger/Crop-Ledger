import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { contractRoutes } from './contract.routes';
import { accountRoutes } from './account.routes';
import { forecastRoutes } from './forecast.routes';
import { healthRoutes } from './health.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(contractRoutes, { prefix: '/api/v1/contracts' });
  await fastify.register(accountRoutes, { prefix: '/api/v1/accounts' });
  await fastify.register(forecastRoutes, { prefix: '/api/v1/forecast' });
  await fastify.register(healthRoutes, { prefix: '/health' });
}
