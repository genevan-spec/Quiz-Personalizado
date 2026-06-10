import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── vi.hoisted garante que mockDb está disponível na factory do vi.mock ────
const mockDb = vi.hoisted(() => ({
  score: { create: vi.fn() },
  $connect:    vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

describe('POST /api/scores', () => {
  let app;
  let validToken;

  beforeEach(async () => {
    vi.clearAllMocks();
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

  it('retorna 400 para payload inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/scores',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { score: -1, total: 0 }, // total mínimo é 1
    });
    expect(res.statusCode).toBe(400);
  });
});
