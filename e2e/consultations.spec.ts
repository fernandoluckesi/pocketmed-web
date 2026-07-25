import { test, expect } from '@playwright/test';
import { loginAsDoctor } from './helpers/auth';

test.describe('Consultas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDoctor(page);
    await page.goto('/patients');
    await page.click('button:has-text("Meus Pacientes")');
    await page.waitForSelector('text=Pacientes Ativos', { timeout: 10000 });
    const firstPatient = page.locator('a[href*="/patients/"]').first();
    await firstPatient.click();
    await page.waitForURL(/patients\/.+/);
  });

  test('deve abrir modal de nova consulta', async ({ page }) => {
    await page.locator('[data-testid="btn-nova-consulta"]').click();
    await expect(page.locator('input[name="consulta-data"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="consulta-hora"]')).toBeVisible();
  });

  test('deve criar consulta simples', async ({ page }) => {
    await page.locator('[data-testid="btn-nova-consulta"]').click();
    await page.fill('input[name="consulta-data"]', '2026-08-01');
    await page.fill('input[name="consulta-hora"]', '10:00');
    await page.fill('textarea[name="consulta-sintomas"]', 'E2E teste simples');
    await page.click('button:has-text("Salvar Consulta")');
    // Modal closes
    await expect(page.locator('input[name="consulta-data"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('deve criar consulta finalizada', async ({ page }) => {
    await page.locator('[data-testid="btn-nova-consulta"]').click();
    await page.fill('input[name="consulta-data"]', '2026-08-02');
    await page.fill('input[name="consulta-hora"]', '14:00');
    await page.fill('textarea[name="consulta-sintomas"]', 'E2E finalizada');
    // Check finalizada
    await page.locator('input[type="checkbox"]').first().check();
    await expect(page.locator('textarea[name="consulta-diagnostico"]')).toBeVisible();
    await page.fill('textarea[name="consulta-diagnostico"]', 'Enxaqueca');
    await page.fill('textarea[name="consulta-orientacoes"]', 'Repouso');
    await page.click('button:has-text("Salvar Consulta")');
    await expect(page.locator('input[name="consulta-data"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar checkboxes de medicamento e exame ao finalizar', async ({ page }) => {
    await page.locator('[data-testid="btn-nova-consulta"]').click();
    await page.locator('input[type="checkbox"]').first().check();
    await expect(page.locator('text=Adicionar medicamento')).toBeVisible();
    await expect(page.locator('text=Adicionar exame')).toBeVisible();
  });

  test('deve clicar em consulta e ver detalhes', async ({ page }) => {
    // Wait for list to have items
    const card = page.locator('[class*="cursor-pointer"][class*="rounded-2xl"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      await card.click();
      await expect(page.locator('text=Sintomas').or(page.locator('text=Status'))).toBeVisible({ timeout: 5000 });
    }
  });
});
