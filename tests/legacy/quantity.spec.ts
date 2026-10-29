import { test, expect } from '../fixtures/workshop.fixture';
import { loginThroughApi, prepareCartA } from '../api/workshop-client';

test('[SC-08] [legacy] ilość równa zero jest odrzucona bez zmiany koszyka', async ({ page, workspace }) => {
  await loginThroughApi(page.context(), workspace);
  await prepareCartA(page.context());
  await page.goto('/');
  await expect(page.getByTestId('cart-total')).toHaveText('250,00 zł');
  const quantity = page.getByTestId('cart-quantity-BOOK-100');
  await quantity.fill('0');
  await quantity.press('Enter');
  await expect(page.getByRole('alert'), 'ORACLE:SC08-QUANTITY').toHaveText('Ilość musi być liczbą od 1 do 99');
  await expect(quantity, 'ORACLE:SC08-QUANTITY').toHaveValue('2');
  await expect(page.getByTestId('cart-quantity-MUG-050')).toHaveValue('1');
  await expect(page.getByTestId('cart-total'), 'ORACLE:SC08-QUANTITY').toHaveText('250,00 zł');
  const cart = await (await page.context().request.get('/api/cart')).json();
  expect(cart.items.find((item: { sku: string }) => item.sku === 'BOOK-100').quantity, 'ORACLE:SC08-QUANTITY').toBe(2);
});
