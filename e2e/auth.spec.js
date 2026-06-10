import { test, expect } from '@playwright/test';

/**
 * E2E — Auth modal (login / registo)
 *
 * Estes testes verificam a UI do modal sem backend real.
 * Pedidos de rede à API são interceptados e devolvem respostas mockadas.
 */

test.describe('AuthModal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard');
  });

  test('botões de Login e Criar conta estão visíveis quando não autenticado', async ({ page }) => {
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible();
  });

  test('abre o modal de login ao clicar em Login', async ({ page }) => {
    await page.getByRole('button', { name: /^login$/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: /login/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('muda para tab de Registo', async ({ page }) => {
    await page.getByRole('button', { name: /^login$/i }).click();
    await page.getByRole('tab', { name: /registo/i }).click();
    await expect(page.getByLabel(/nome de utilizador/i)).toBeVisible();
  });

  test('fecha modal com tecla Escape', async ({ page }) => {
    await page.getByRole('button', { name: /^login$/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('mostra erro de API quando login falha', async ({ page }) => {
    // Intercept da chamada à API
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciais inválidas.' }),
      });
    });

    await page.getByRole('button', { name: /^login$/i }).click();
    await page.getByLabel(/email/i).fill('errado@test.com');
    await page.getByLabel(/password/i).fill('errado');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByRole('alert').filter({ hasText: /credenciais inválidas/i })).toBeVisible();
  });

  test('fecha modal após login bem sucedido', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake.jwt.token',
          user: { id: 1, username: 'Smilley', email: 'smilley@test.com' },
        }),
      });
    });
    await page.route('**/api/leaderboard', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.getByRole('button', { name: /^login$/i }).click();
    await page.getByLabel(/email/i).fill('smilley@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/olá, smilley/i)).toBeVisible();
  });
});
