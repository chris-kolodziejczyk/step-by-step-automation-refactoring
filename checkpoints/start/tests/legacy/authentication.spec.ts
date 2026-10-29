import { test, expect } from '../fixtures/workshop.fixture';

test('[SC-01] [legacy] poprawne logowanie udostępnia katalog i dane użytkownika', async ({ page, workspace }) => {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(workspace.user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(workspace.user.password);
  await page.getByRole('button', { name: 'Zaloguj', exact: true }).click();
  await expect(page.getByTestId('user-email')).toHaveText('qa@example.test');
  await expect(page.getByTestId('product-BOOK-100')).toBeVisible();
  await expect(page.getByTestId('product-MUG-050')).toBeVisible();
  const protectedCart = await page.context().request.get('/api/cart');
  expect(protectedCart.status()).toBe(200);
});

test('[SC-02] [legacy] błędne logowanie nie daje dostępu do chronionego koszyka', async ({ page, workspace }) => {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(workspace.user.email);
  await page.getByLabel('Hasło', { exact: true }).fill('incorrect-password');
  await page.getByRole('button', { name: 'Zaloguj', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Nieprawidłowe dane logowania');
  await expect(page.getByTestId('user-email')).toHaveCount(0);
  const protectedCart = await page.context().request.get('/api/cart');
  expect(protectedCart.status(), 'ORACLE:SC02-ACCESS').toBe(401);
});
