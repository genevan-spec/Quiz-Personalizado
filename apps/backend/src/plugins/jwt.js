// Plugin JWT — RS256 com chaves RSA em ficheiro ou variáveis de ambiente
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_DIR = resolve(__dirname, '../../keys');

function loadKey(envVar, filename) {
  if (process.env[envVar]) {
    return Buffer.from(process.env[envVar], 'base64').toString('utf8');
  }
  const filePath = resolve(KEYS_DIR, filename);
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf8');
  }
  return null;
}

export default fp(async function jwtPlugin(app) {
  const privateKey = loadKey('JWT_PRIVATE_KEY_B64', 'private.pem');
  const publicKey  = loadKey('JWT_PUBLIC_KEY_B64',  'public.pem');

  if (!privateKey || !publicKey) {
    throw new Error(
      'JWT keys not found. Run: node scripts/generate-keys.js\n' +
      'Or set JWT_PRIVATE_KEY_B64 and JWT_PUBLIC_KEY_B64 env vars.'
    );
  }

  await app.register(fjwt, {
    secret: {
      private: privateKey,
      public:  publicKey,
    },
    sign:   { algorithm: 'RS256', expiresIn: '7d' },
    verify: { algorithms: ['RS256'] },
  });

  // Decorator: preHandler para rotas protegidas
  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}, { name: 'jwt', dependencies: [] });
