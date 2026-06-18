import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const mockDb = {
  score: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

const SCORES = [
  { userId: 1, score: 9, total: 10, percentage: 90, category: 'Angola 🇦🇴', createdAt: new Date().toISOString(), user: { username: 'Smilley' } },
  { userId: 2, score: 7, total: 10, percentage: 70, category: 'geral', createdAt: new Date().toISOString(), user: { username: 'Tavares' } },
];

describe('GET /api/leaderboard', () => {
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
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
    const duplicate = [
      ...SCORES,
      { userId: 1, score: 5, total: 10, percentage: 50, category: 'geral', createdAt: new Date().toISOString(), user: { username: 'Smilley' } },
    ];
    mockDb.score.findMany.mockResolvedValue(duplicate);

    const res = await app.inject({ method: 'GET', url: '/api/leaderboard' });
    const body = res.json();

    const smilleyEntries = body.filter((e) => e.username === 'Smilley');
    expect(smilleyEntries).toHaveLength(1);
    expect(smilleyEntries[0].score).toBe(9); // melhor score
  });

  it('limita o resultado a no máximo 10 entradas', async () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      userId: i + 1,
      score: 10 - (i % 10),
      total: 10,
      percentage: 100 - i,
      category: 'geral',
      createdAt: new Date().toISOString(),
      user: { username: `User${i + 1}` },
    }));
    mockDb.score.findMany.mockResolvedValue(many);

    const res = await app.inject({ method: 'GET', url: '/api/leaderboard' });
    expect(res.json()).toHaveLength(10);
  });
});
