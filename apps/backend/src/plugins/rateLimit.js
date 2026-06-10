// Plugin de rate limiting — limites globais e por rota
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async function rateLimitPlugin(app) {
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Demasiados pedidos. Tenta novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
    }),
  });
}, { name: 'rate-limit' });
