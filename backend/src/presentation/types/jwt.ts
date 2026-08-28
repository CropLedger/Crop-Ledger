import '@fastify/jwt';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}
