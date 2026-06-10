import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── vi.hoisted garante que mockDb está disponível na factory do vi.mock ────
const mockDb = vi.hoisted(() => ({
  user: {
    findFirst:  vi.fn(),
    findUnique: vi.fn(),
    create:     vi.fn(),
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

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterEach(() => app.close());

  it('retorna 201 com token e user quando dados válidos', async () => {
    mockDb.user.findFirst.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({
      id: 1,
      username: 'Smilley',
      email: 'smilley@test.com',
      createdAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'Smilley', email: 'smilley@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.username).toBe('Smilley');
  });

  it('retorna 409 quando utilizador já existe', async () => {
    mockDb.user.findFirst.mockResolvedValue({ id: 1, username: 'Smilley' });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'Smilley', email: 'smilley@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toMatch(/já registado/i);
  });

  it('retorna 400 quando faltam campos obrigatórios', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'ab' }, // muito curto, faltam campos
    });
    expect(res.statusCode).toBe(400);
  });
});

// ──────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterEach(() => app.close());

  it('retorna 401 quando credenciais inválidas', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'ghost@test.com', password: 'wrongpass' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toMatch(/inválidas/i);
  });

  it('retorna 400 para payload inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'not-an-email', password: 'p' },
    });
    expect(res.statusCode).toBe(400);
  });
});
