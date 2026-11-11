import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabase } from '../../infrastructure/database/supabase-client.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    try {
      const [contractsRes, accountsRes] = await Promise.all([
        supabase.from('contracts').select('status, total_price'),
        supabase.from('accounts').select('id', { count: 'exact', head: true }),
      ]);

      const contracts = contractsRes.data ?? [];
      const totalContracts = contracts.length;
      const totalValue = contracts.reduce((sum: number, c: any) => sum + (c.total_price ?? 0), 0);
      const pendingContracts = contracts.filter((c: any) => c.status === 'PENDING').length;
      const completedContracts = contracts.filter((c: any) => c.status === 'COMPLETED').length;
      const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE').length;
      const totalAccounts = accountsRes.count ?? 0;

      reply.send({
        totalContracts,
        totalValue,
        pendingContracts,
        completedContracts,
        activeContracts,
        totalAccounts,
      });
    } catch (error: any) {
      reply.status(500).send({ error: 'Failed to fetch analytics stats' });
    }
  });
}
