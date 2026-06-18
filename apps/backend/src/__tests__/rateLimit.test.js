import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const mockDb = {
  user: { findUnique: jest.fn().mockResolvedValue(null) },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

describe('Rate limit em /api/auth/login (máx. 10/min)', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(() => app.close());

  it('bloqueia com 429 após exceder o limite de pedidos', async () => {
    const payload = { email: 'qualquer@test.com', password: 'wrongpass' };
    let lastStatus;

    for (let i = 0; i < 11; i++) {
      const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload });
      lastStatus = res.statusCode;
    }

    // O 11º pedido (dentro da mesma janela de 1 minuto) deve ser bloqueado
    expect(lastStatus).toBe(429);
  });
});
