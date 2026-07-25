import { test, expect } from '@playwright/test';
import { loginAsDoctor } from './helpers/auth';

test.describe('Medicamentos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDoctor(page);
  });

  test('deve abrir modal de prescrever medicamento', async ({ page }) => {
    await page.goto('/patients');
    await page.click('text=Meus Pacientes');
    await page.waitForSelector('text=Pacientes Ativos', { timeout: 10000 });

    const firstPatient = page.locator('a[href*="/patients/"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
      await page.waitForURL(/patients\//);

      // Go to Medicamentos tab
      await page.click('button:has-text("Medicamentos")');
      await page.click('text=Adicionar Medicamento');

      await expect(page.locator('text=Prescrever Medicamento')).toBeVisible();
    }
  });

  test('deve exibir select de frequência com opções corretas', async ({ page }) => {
    await page.goto('/patients');
    await page.click('text=Meus Pacientes');
    await page.waitForSelector('text=Pacientes Ativos', { timeout: 10000 });

    const firstPatient = page.locator('a[href*="/patients/"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
      await page.waitForURL(/patients\//);

      await page.click('button:has-text("Medicamentos")');
      await page.click('text=Adicionar Medicamento');

      // Check frequency select has correct options
      const selectFreq = page.locator('select[name*="frequencia"]').first();
      await expect(selectFreq).toBeVisible();
      await expect(selectFreq.locator('option[value="daily"]')).toHaveText('Diário');
      await expect(selectFreq.locator('option[value="twice_daily"]')).toHaveText('2x ao dia');
      await expect(selectFreq.locator('option[value="three_times_daily"]')).toHaveText('3x ao dia');
      await expect(selectFreq.locator('option[value="four_times_daily"]')).toHaveText('4x ao dia');
    }
  });

  test('deve mostrar horários distribuídos ao selecionar frequência', async ({ page }) => {
    await page.goto('/patients');
    await page.click('text=Meus Pacientes');
    await page.waitForSelector('text=Pacientes Ativos', { timeout: 10000 });

    const firstPatient = page.locator('a[href*="/patients/"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
      await page.waitForURL(/patients\//);

      await page.click('button:has-text("Medicamentos")');
      await page.click('text=Adicionar Medicamento');

      // Select "2x ao dia"
      await page.selectOption('select[name*="frequencia"]', 'twice_daily');

      // Should show 2 time inputs
      const timeInputs = page.locator('input[type="time"]');
      await expect(timeInputs).toHaveCount(2);
    }
  });
});
