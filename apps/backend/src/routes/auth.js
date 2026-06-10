// Rotas de autenticação: POST /api/auth/register  e  POST /api/auth/login
import bcrypt from 'bcryptjs';

const registerSchema = {
  body: {
    type: 'object',
    required: ['username', 'email', 'password'],
    additionalProperties: false,
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 50 },
      email:    { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 8, maxLength: 100 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user:  {
          type: 'object',
          properties: {
            id:        { type: 'integer' },
            username:  { type: 'string' },
            email:     { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  },
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email:    { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user:  {
          type: 'object',
          properties: {
            id:       { type: 'integer' },
            username: { type: 'string' },
            email:    { type: 'string' },
          },
        },
      },
    },
  },
};

// Limite mais restrito para endpoints de autenticação (previne brute-force)
const authRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

export default async function authRoutes(app) {
  // POST /api/auth/register
  app.post('/register', { schema: registerSchema, ...authRateLimit }, async (request, reply) => {
    const { username, email, password } = request.body;

    const existing = await app.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return reply.status(409).send({ error: 'Utilizador ou email já registado.' });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await app.prisma.user.create({
      data: { username, email, password: hash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    const token = app.jwt.sign({ sub: user.id, username: user.username });

    return reply.status(201).send({ token, user });
  });

  // POST /api/auth/login
  app.post('/login', { schema: loginSchema, ...authRateLimit }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await app.prisma.user.findUnique({ where: { email } });

    // Tempo constante para não revelar se o email existe
    const dummyHash = '$2a$12$placeholderHashForTimingAttackPrevention000000000000000';
    const hash = user?.password ?? dummyHash;
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      return reply.status(401).send({ error: 'Credenciais inválidas.' });
    }

    const token = app.jwt.sign({ sub: user.id, username: user.username });

    return reply.send({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  });
}
