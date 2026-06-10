#!/usr/bin/env node
// Gera um par de chaves RSA-2048 para o JWT (RS256)
// Utilização: node scripts/generate-keys.js

import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_DIR = resolve(__dirname, '../apps/backend/keys');

if (!existsSync(KEYS_DIR)) {
  mkdirSync(KEYS_DIR, { recursive: true });
}

const privatePath = resolve(KEYS_DIR, 'private.pem');
const publicPath  = resolve(KEYS_DIR, 'public.pem');

if (existsSync(privatePath) && existsSync(publicPath)) {
  console.log('✔  Chaves já existem em apps/backend/keys/ — nada a fazer.');
  process.exit(0);
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

writeFileSync(privatePath, privateKey, { mode: 0o600 });
writeFileSync(publicPath,  publicKey,  { mode: 0o644 });

console.log('✅  Chaves RSA-2048 geradas:');
console.log(`    Private → ${privatePath}`);
console.log(`    Public  → ${publicPath}`);
console.log('\n   As chaves estão no .gitignore (apps/backend/keys/).');
