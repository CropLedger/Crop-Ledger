import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
// import swagger from '@fastify/swagger';
// import { swaggerUI } from '@fastify/swagger-ui';
import { registerRoutes } from './presentation/routes';
import { registerWebSockets } from './presentation/websockets';
import { errorHandler } from './presentation/middleware/error-handler';

const fastify = Fastify({
  logger: true,
  http2: false,
});

async function bootstrap() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'secret-key',
  });

  // Rate Limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // WebSocket
  await fastify.register(websocket);

  // Swagger (commented out for now)
  // await fastify.register(swagger, {
  //   openapi: {
  //     info: {
  //       title: 'CropLedger Enterprise API',
  //       description: 'Enterprise agricultural supply chain management API',
  //       version: '1.0.0',
  //     },
  //     servers: [
  //       {
  //         url: 'http://localhost:4000',
  //         description: 'Development server',
  //       },
  //     ],
  //     components: {
  //       securitySchemes: {
  //         bearerAuth: {
  //           type: 'http',
  //           scheme: 'bearer',
  //           bearerFormat: 'JWT',
  //         },
  //       },
  //     },
  //   },
  // });

  // await fastify.register(swaggerUI, {
  //   routePrefix: '/docs',
  //   uiConfig: {
  //     docExpansion: 'list',
  //     deepLinking: true,
  //   },
  // });

  // Error Handler
  fastify.setErrorHandler(errorHandler);

  // Routes
  await registerRoutes(fastify);

  // WebSockets
  await registerWebSockets(fastify);

  // Start server
  const port = parseInt(process.env.PORT || '4000', 10);
  await fastify.listen({ port, host: '0.0.0.0' });
  
  console.log(`🚀 CropLedger API running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
