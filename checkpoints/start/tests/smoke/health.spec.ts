import { test, expect } from '@playwright/test';

test('[SMOKE] lokalna aplikacja odpowiada i wyświetla formularz', async ({ request, page }) => {
  const response = await request.get('/healthz');
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ app: 'qualitycart', version: '0.1.0' });
  await page.goto('/');
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zaloguj', exact: true })).toBeVisible();
});
