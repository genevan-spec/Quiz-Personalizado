import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── vi.hoisted garante que mockDb está disponível na factory do vi.mock ────
const mockDb = vi.hoisted(() => ({
  score: {
    findMany: vi.fn(),
    create:   vi.fn(),
  },
  $connect:    vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

const SCORES = [
  { userId: 1, score: 9, total: 10, percentage: 90, category: 'Angola 🇦🇴', createdAt: new Date().toISOString(), user: { username: 'Smilley' } },
  { userId: 2, score: 7, total: 10, percentage: 70, category: 'geral',       createdAt: new Date().toISOString(), user: { username: 'Tavares' } },
];

describe('GET /api/leaderboard', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterEach(() => app.close());

  it('retorna array com rank e campos esperados', async () => {
    mockDb.score.findMany.mockResolvedValue(SCORES);

    const res = await app.inject({ method: 'GET', url: '/api/leaderboard' });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({ rank: 1, username: 'Smilley', score: 9, total: 10 });
    expect(body[1].rank).toBe(2);
  });

  it('retorna array vazio quando não há scores', async () => {
    mockDb.score.findMany.mockResolvedValue([]);

    const res = await app.inject({ method: 'GET', url: '/api/leaderboard' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('mantém apenas o melhor score por utilizador', async () => {
    // Mesmo utilizador com dois scores
    const duplicate = [
      ...SCORES,
      { userId: 1, score: 5, total: 10, percentage: 50, category: 'geral', createdAt: new Date().toISOString(), user: { username: 'Smilley' } },
    ];
    mockDb.score.findMany.mockResolvedValue(duplicate);

    const res = await app.inject({ method: 'GET', url: '/api/leaderboard' });
    const body = res.json();

    // Smilley só deve aparecer uma vez
    const smilleyEntries = body.filter((e) => e.username === 'Smilley');
    expect(smilleyEntries).toHaveLength(1);
    expect(smilleyEntries[0].score).toBe(9); // melhor score
  });
});
