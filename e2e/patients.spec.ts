import { test, expect } from '@playwright/test';
import { loginAsDoctor } from './helpers/auth';

test.describe('Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDoctor(page);
  });

  test('deve navegar para a tela de pacientes', async ({ page }) => {
    await page.click('text=Pacientes');
    await expect(page).toHaveURL(/patients/);
    await expect(page.locator('text=Gestão de Pacientes')).toBeVisible();
  });

  test('deve exibir lista de Meus Pacientes', async ({ page }) => {
    await page.goto('/patients');
    await page.click('button:has-text("Meus Pacientes")');
    await expect(page.locator('text=Pacientes Ativos')).toBeVisible({ timeout: 10000 });
  });

  test('deve buscar paciente na aba Pesquisar', async ({ page }) => {
    await page.goto('/patients');
    await page.click('button:has-text("Pesquisar Pacientes")');
    await page.fill('input[placeholder*="Nome ou CPF"]', 'maria');
    await page.click('button:has-text("Pesquisar")');
    await expect(page.locator('text=Pacientes Encontrados')).toBeVisible({ timeout: 10000 });
  });

  test('deve abrir modal de adicionar paciente', async ({ page }) => {
    await page.goto('/patients');
    await page.click('button:has-text("Adicionar Paciente")');
    await expect(page.locator('input[placeholder="Ana Maria Silveira"]')).toBeVisible({ timeout: 5000 });
  });

  test('deve acessar detalhes do paciente', async ({ page }) => {
    await page.goto('/patients');
    await page.click('button:has-text("Meus Pacientes")');
    await page.waitForSelector('text=Pacientes Ativos', { timeout: 10000 });
    const firstPatient = page.locator('a[href*="/patients/"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
      await expect(page).toHaveURL(/patients\/.+/);
    }
  });
});
