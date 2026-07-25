import { Page } from '@playwright/test';

export const DOCTOR_CREDENTIALS = {
  email: 'fernando.luckesi.dr@gmail.com',
  password: '958969',
};

export const PATIENT_CREDENTIALS = {
  email: 'maria.silva@email.com',
  password: '958969',
};

export async function loginAsDoctor(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', DOCTOR_CREDENTIALS.email);
  await page.fill('input[type="password"]', DOCTOR_CREDENTIALS.password);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

export async function loginAsPatient(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', PATIENT_CREDENTIALS.email);
  await page.fill('input[type="password"]', PATIENT_CREDENTIALS.password);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}
