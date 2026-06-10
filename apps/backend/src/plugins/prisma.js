// Plugin Prisma — instância única partilhada por toda a aplicação
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

export default fp(async function prismaPlugin(app) {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

  await prisma.$connect();

  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}, { name: 'prisma' });
