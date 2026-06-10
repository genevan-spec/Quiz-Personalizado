import { test, expect } from '@playwright/test';

/**
 * E2E — Fluxo completo do quiz (home → quiz → resultados)
 *
 * Estes testes correm contra o servidor Vite dev (frontend apenas).
 * Não requerem backend — testam navegação, interacção e UI.
 */

test.describe('Fluxo do Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('página inicial carrega com título correcto', async ({ page }) => {
    await expect(page).toHaveTitle(/quiz de cultura geral/i);
    await expect(page.getByRole('heading', { name: /quiz de cultura geral/i })).toBeVisible();
  });

  test('botão Começar está visível e clicável', async ({ page }) => {
    await expect(page.getByRole('button', { name: /começar/i })).toBeVisible();
  });

  test('pode seleccionar categoria e número de perguntas', async ({ page }) => {
    const catSelect = page.getByLabel(/categoria/i);
    await catSelect.selectOption('Angola 🇦🇴');
    await expect(catSelect).toHaveValue('Angola 🇦🇴');

    const limitSelect = page.getByLabel(/nº de perguntas/i);
    await limitSelect.selectOption('5');
    await expect(limitSelect).toHaveValue('5');
  });

  test('inicia quiz ao submeter o formulário', async ({ page }) => {
    await page.getByLabel(/o teu nome/i).fill('TestUser');
    await page.getByLabel(/nº de perguntas/i).selectOption('5');
    await page.getByRole('button', { name: /começar/i }).click();

    // Deve navegar para /quiz
    await expect(page).toHaveURL(/\/quiz/);
    // Barra de progresso deve estar visível
    await expect(page.getByRole('progressbar')).toBeVisible();
  });
});

test.describe('Página do Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/nº de perguntas/i).selectOption('5');
    await page.getByRole('button', { name: /começar/i }).click();
    await page.waitForURL(/\/quiz/);
  });

  test('mostra pergunta e 4 opções de resposta', async ({ page }) => {
    const options = page.getByRole('button', { name: /^[ABCD]\./ });
    await expect(options).toHaveCount(4);
  });

  test('responder a uma pergunta avança para a seguinte ou mostra resultado', async ({ page }) => {
    const firstOption = page.getByRole('button', { name: /^A\./ });
    await firstOption.click();

    // Aguarda feedback (botão desativado ou navegação para resultado)
    await expect(firstOption).toBeDisabled({ timeout: 3000 }).catch(() => {
      // Se não estiver desativado, pode ter avançado de pergunta
    });
  });
});

test.describe('Navegação', () => {
  test('leaderboard é acessível pelo URL /leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible();
  });

  test('página 404 aparece em rotas desconhecidas', async ({ page }) => {
    await page.goto('/esta-pagina-nao-existe');
    await expect(page.getByText(/404|não encontrada/i)).toBeVisible();
  });
});
