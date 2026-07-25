import { test, expect } from '@playwright/test';
import { DOCTOR_CREDENTIALS } from './helpers/auth';

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', DOCTOR_CREDENTIALS.email);
    await page.fill('input[type="password"]', DOCTOR_CREDENTIALS.password);
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('deve mostrar erro com senha incorreta', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', DOCTOR_CREDENTIALS.email);
    await page.fill('input[type="password"]', 'senhaerrada123');
    await page.click('button:has-text("Entrar")');
    // Wait for error message
    await expect(page.locator('text=E-mail ou senha incorretos')).toBeVisible({ timeout: 10000 });
  });

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('deve navegar para cadastro de médico', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Cadastre-se agora');
    await expect(page).toHaveURL(/signup/);
  });
});
