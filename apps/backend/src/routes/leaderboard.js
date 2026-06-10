// GET /api/leaderboard  — top 10 scores únicos por utilizador

export default async function leaderboardRoutes(app) {
  app.get('/leaderboard', async () => {
    // Obtém todos os scores ordenados por percentagem decrescente
    const allScores = await app.prisma.score.findMany({
      orderBy: [{ percentage: 'desc' }, { createdAt: 'asc' }],
      include: { user: { select: { username: true } } },
    });

    // Mantém apenas o melhor score por utilizador (primeiro encontrado = melhor)
    const seen = new Set();
    const top = [];
    for (const entry of allScores) {
      if (!seen.has(entry.userId)) {
        seen.add(entry.userId);
        top.push(entry);
        if (top.length === 10) break;
      }
    }

    return top.map((entry, idx) => ({
      rank:       idx + 1,
      username:   entry.user.username,
      score:      entry.score,
      total:      entry.total,
      percentage: Math.round(entry.percentage),
      category:   entry.category,
      date:       entry.createdAt,
    }));
  });
}
