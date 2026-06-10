// Factory da aplicação Fastify — separado do server.js para facilitar testes
import Fastify from 'fastify';
import cors from '@fastify/cors';

import prismaPlugin from './plugins/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import rateLimitPlugin from './plugins/rateLimit.js';

import authRoutes from './routes/auth.js';
import questionsRoutes from './routes/questions.js';
import scoresRoutes from './routes/scores.js';
import leaderboardRoutes from './routes/leaderboard.js';

/**
 * @param {import('fastify').FastifyServerOptions} opts
 * @returns {import('fastify').FastifyInstance}
 */
export function buildApp(opts = {}) {
  const app = Fastify(opts);

  // ── Plugins globais ───────────────────────────────────────────────────────
  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  app.register(rateLimitPlugin);
  app.register(prismaPlugin);
  app.register(jwtPlugin);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── Rotas da API ──────────────────────────────────────────────────────────
  app.register(authRoutes,        { prefix: '/api/auth' });
  app.register(questionsRoutes,   { prefix: '/api' });
  app.register(scoresRoutes,      { prefix: '/api' });
  app.register(leaderboardRoutes, { prefix: '/api' });

  return app;
}
