/**
 * Helpers partilhados pelos testes de integração do backend.
 *
 * Constroem uma instância Fastify com Prisma substituído por um mock
 * para que os testes não precisem de uma base de dados real.
 */
import { buildApp } from '../app.js';

/**
 * Cria e inicializa a app com um cliente Prisma mockado.
 * @param {object} prismaMock  Objecto com os métodos do Prisma que os testes precisam.
 */
export async function buildTestApp(prismaMock = {}) {
  const app = buildApp({ logger: false });

  // Substituir o plugin prisma por um decorator directo
  await app.ready();
  // O plugin já decorou app.prisma — substituímos pelo mock após ready
  app.prisma = prismaMock;

  return app;
}
