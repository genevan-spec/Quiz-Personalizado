// Gera chaves RSA temporárias para que o plugin JWT não falhe nos testes.
// Este ficheiro é executado antes de todos os suites via vitest.config.js > setupFiles.
import { generateKeyPairSync } from 'node:crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

process.env.JWT_PRIVATE_KEY_B64 = Buffer.from(
  privateKey.export({ type: 'pkcs8', format: 'pem' })
).toString('base64');

process.env.JWT_PUBLIC_KEY_B64 = Buffer.from(
  publicKey.export({ type: 'spki', format: 'pem' })
).toString('base64');

// Silencia logs durante testes
process.env.NODE_ENV = 'test';
