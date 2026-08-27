import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode = error.statusCode || 500;
  
  reply.status(statusCode).send({
    error: {
      message: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    },
  });
}
