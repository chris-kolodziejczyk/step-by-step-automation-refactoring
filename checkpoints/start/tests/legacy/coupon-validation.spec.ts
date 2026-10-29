import { test, expect } from '../fixtures/workshop.fixture';

test('[SC-05] [legacy] odrzucony kupon nie zmienia zawartości ani kwot', async ({ page, workspace }) => {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(workspace.user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(workspace.user.password);
  await page.getByRole('button', { name: 'Zaloguj', exact: true }).click();
  await expect(page.getByTestId('user-email')).toHaveText(workspace.user.email);
  await page.getByTestId('product-BOOK-100').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('1');
  await page.getByTestId('product-BOOK-100').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await page.getByTestId('product-MUG-050').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('250,00 zł');
  await expect(page.getByTestId('coupon-active')).toHaveText('Brak');
  await page.getByTestId('coupon-code').fill('NOPE');
  await page.getByTestId('coupon-apply').click();
  await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy kupon');
  await expect(page.getByTestId('coupon-active')).toHaveText('Brak');
  await expect(page.getByTestId('cart-discount')).toHaveText('0,00 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('250,00 zł');
  await expect(page.getByTestId('cart-item-BOOK-100')).toContainText('BOOK-100');
  await expect(page.getByTestId('cart-item-MUG-050')).toContainText('MUG-050');
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await expect(page.getByTestId('cart-quantity-MUG-050')).toHaveValue('1');
});

test('[SC-06] [legacy] usunięcie kubka zostawia dwie książki za 200 zł', async ({ page, workspace }) => {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(workspace.user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(workspace.user.password);
  await page.getByRole('button', { name: 'Zaloguj', exact: true }).click();
  await expect(page.getByTestId('user-email')).toHaveText(workspace.user.email);
  await page.getByTestId('product-BOOK-100').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('1');
  await page.getByTestId('product-BOOK-100').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await page.getByTestId('product-MUG-050').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('250,00 zł');
  await page.getByTestId('remove-MUG-050').click();
  await expect(page.getByTestId('cart-item-MUG-050'), 'ORACLE:SC06-REMOVED').toHaveCount(0);
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await expect(page.getByTestId('cart-total'), 'ORACLE:SC06-TOTAL').toHaveText('200,00 zł');
  await expect(page.getByTestId('cart-discount')).toHaveText('0,00 zł');
});
