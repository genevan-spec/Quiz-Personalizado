import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const mockDb = {
  score: { create: jest.fn() },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

describe('POST /api/scores', () => {
  let app;
  let validToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
    validToken = app.jwt.sign({ sub: 42, username: 'Smilley' });
  });

  afterEach(() => app.close());

  it('retorna 401 sem token de autenticação', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      payload: { score: 8, total: 10, category: 'geral' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('retorna 401 com token inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      headers: { authorization: 'Bearer token-invalido' },
      payload: { score: 8, total: 10, category: 'geral' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('cria score e retorna 201 quando autenticado', async () => {
    const saved = {
      id: 1, score: 8, total: 10, percentage: 80,
      category: 'geral', createdAt: new Date().toISOString(),
      user: { username: 'Smilley' },
    };
    mockDb.score.create.mockResolvedValue(saved);

    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { score: 8, total: 10, category: 'geral' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.score).toBe(8);
    expect(body.percentage).toBe(80);
    expect(mockDb.score.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 42, score: 8, total: 10 }),
      })
    );
  });

  it('retorna 400 quando score > total', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { score: 15, total: 10, category: 'geral' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/total/i);
  });

  it('retorna 400 para payload inválido (total abaixo do mínimo)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { score: -1, total: 0 }, // total mínimo é 1
    });
    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 quando faltam campos obrigatórios', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { score: 5 }, // faltam total e category
    });
    expect(res.statusCode).toBe(400);
  });
});
