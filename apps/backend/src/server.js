// Ponto de entrada do servidor Fastify
import { buildApp } from './app.js';

const app = buildApp({ logger: true });

const start = async () => {
  try {
    const host = process.env.HOST ?? '0.0.0.0';
    const port = Number(process.env.PORT ?? 3000);
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
