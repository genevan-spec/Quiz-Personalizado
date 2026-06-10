// GET /api/questions?category=&limit=
// GET /api/categories

const questionsQuerySchema = {
  querystring: {
    type: 'object',
    additionalProperties: false,
    properties: {
      category: { type: 'string', maxLength: 100 },
      limit:    { type: 'integer', minimum: 1, maximum: 50, default: 10 },
    },
  },
};

export default async function questionsRoutes(app) {
  // GET /api/questions
  app.get('/questions', { schema: questionsQuerySchema }, async (request) => {
    const { category, limit = 10 } = request.query;

    const where = category && category !== 'todas'
      ? { category: { name: category } }
      : {};

    const questions = await app.prisma.question.findMany({
      where,
      take: limit,
      include: { category: { select: { name: true } } },
    });

    // Misturar aleatoriamente antes de devolver
    const shuffled = questions.sort(() => Math.random() - 0.5);

    return shuffled.map((q) => ({
      id:            q.id,
      question:      q.question,
      options:       q.options,
      correctAnswer: q.correctAnswer,
      explanation:   q.explanation,
      hint:          q.hint,
      category:      q.category.name,
    }));
  });

  // GET /api/categories
  app.get('/categories', async () => {
    return app.prisma.category.findMany({ orderBy: { name: 'asc' } });
  });
}
