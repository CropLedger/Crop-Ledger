import { FastifyRequest, FastifyReply } from 'fastify';

export class AccountController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    reply.send({ message: 'Get profile endpoint' });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    reply.send({ message: 'Update profile endpoint' });
  }
}
