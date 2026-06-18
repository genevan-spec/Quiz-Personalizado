import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const mockDb = {
  question: { findMany: jest.fn() },
  category: { findMany: jest.fn() },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() { return mockDb; }
  },
}));

import { buildApp } from '../app.js';

const RAW_QUESTIONS = [
  {
    id: 1, question: 'Qual a capital de Angola?',
    options: ['Luanda', 'Benguela', 'Huambo', 'Lobito'],
    correctAnswer: 0, explanation: 'Luanda é a capital.', hint: 'Fica no litoral.',
    category: { name: 'Angola 🇦🇴' },
  },
  {
    id: 2, question: 'Quantos continentes existem?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2, explanation: '7 continentes.', hint: null,
    category: { name: 'geral' },
  },
];

describe('GET /api/questions', () => {
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterEach(() => app.close());

  it('retorna 200 com a lista de perguntas formatada', async () => {
    mockDb.question.findMany.mockResolvedValue(RAW_QUESTIONS);

    const res = await app.inject({ method: 'GET', url: '/api/questions' });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      id: expect.any(Number),
      question: expect.any(String),
      options: expect.any(Array),
      category: expect.any(String),
    });
  });

  it('aplica o filtro de categoria à query do Prisma', async () => {
    mockDb.question.findMany.mockResolvedValue([RAW_QUESTIONS[0]]);

    const res = await app.inject({ method: 'GET', url: '/api/questions?category=Angola%20%F0%9F%87%A6%F0%9F%87%B4' });

    expect(res.statusCode).toBe(200);
    expect(mockDb.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: { name: 'Angola 🇦🇴' } },
      })
    );
  });

  it('ignora o filtro quando category=todas', async () => {
    mockDb.question.findMany.mockResolvedValue(RAW_QUESTIONS);

    await app.inject({ method: 'GET', url: '/api/questions?category=todas' });

    expect(mockDb.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it('respeita o parâmetro limit', async () => {
    mockDb.question.findMany.mockResolvedValue(RAW_QUESTIONS);

    await app.inject({ method: 'GET', url: '/api/questions?limit=5' });

    expect(mockDb.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it('retorna 400 quando limit excede o máximo permitido (50)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/questions?limit=999' });
    expect(res.statusCode).toBe(400);
  });

  it('ignora silenciosamente parâmetros de query não definidos no schema', async () => {
    mockDb.question.findMany.mockResolvedValue(RAW_QUESTIONS);
    // O Fastify remove propriedades adicionais da querystring por defeito
    // (additionalProperties: false → removeAdditional), em vez de rejeitar o pedido.
    const res = await app.inject({ method: 'GET', url: '/api/questions?hacker=true' });
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/categories', () => {
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterEach(() => app.close());

  it('retorna 200 com a lista de categorias', async () => {
    mockDb.category.findMany.mockResolvedValue([
      { id: 1, name: 'Angola 🇦🇴' },
      { id: 2, name: 'geral' },
    ]);

    const res = await app.inject({ method: 'GET', url: '/api/categories' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
  });
});
