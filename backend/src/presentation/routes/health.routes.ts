import { FastifyInstance } from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  });

  // Temporary endpoint to run Prisma migration (remove after initial setup)
  fastify.post('/migrate', async (request, reply) => {
    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
      return {
        success: true,
        message: 'Migration completed successfully',
        output: stdout,
      };
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: 'Migration failed',
        error: error.message,
        stderr: error.stderr,
      });
    }
  });
}
