import { FastifyInstance } from 'fastify';

export async function registerWebSockets(fastify: FastifyInstance) {
  fastify.register(async function (fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
      connection.socket.on('message', (message: Buffer) => {
        // Handle WebSocket messages
        connection.socket.send('echo: ' + message.toString());
      });
    });
  });
}
