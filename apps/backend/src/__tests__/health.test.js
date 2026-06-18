import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const mockDb = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

describe('GET /health', () => {
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterEach(() => app.close());

  it('retorna 200 com status ok e timestamp', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('buildApp', () => {
  let app;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('regista os decorators essenciais (prisma, jwt, authenticate)', async () => {
    app = buildApp({ logger: false });
    await app.ready();

    expect(app.prisma).toBeDefined();
    expect(app.jwt).toBeDefined();
    expect(typeof app.authenticate).toBe('function');
  });

  it('retorna 404 para rotas inexistentes', async () => {
    app = buildApp({ logger: false });
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/rota-que-nao-existe' });
    expect(res.statusCode).toBe(404);
  });
});
