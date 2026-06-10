// POST /api/scores  (requer autenticação JWT)

const scoreBodySchema = {
  body: {
    type: 'object',
    required: ['score', 'total', 'category'],
    additionalProperties: false,
    properties: {
      score:    { type: 'integer', minimum: 0 },
      total:    { type: 'integer', minimum: 1 },
      category: { type: 'string',  maxLength: 100 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id:         { type: 'integer' },
        score:      { type: 'integer' },
        total:      { type: 'integer' },
        percentage: { type: 'number' },
        category:   { type: 'string' },
        createdAt:  { type: 'string' },
        user: {
          type: 'object',
          properties: { username: { type: 'string' } },
        },
      },
    },
  },
};

export default async function scoresRoutes(app) {
  // POST /api/scores
  app.post('/scores', {
    schema: scoreBodySchema,
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const { score, total, category } = request.body;
    const userId = request.user.sub;

    if (score > total) {
      return reply.status(400).send({ error: 'score não pode ser maior que total.' });
    }

    const percentage = (score / total) * 100;

    const saved = await app.prisma.score.create({
      data: { userId, score, total, percentage, category },
      include: { user: { select: { username: true } } },
    });

    return reply.status(201).send(saved);
  });
}
