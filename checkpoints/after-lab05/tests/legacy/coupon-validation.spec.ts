import { test, expect } from '../fixtures/workshop.fixture';
import { loginThroughApi, prepareCartA } from '../api/workshop-client';
import { CartView } from '../ui/cart';

test('[SC-05] [legacy] odrzucony kupon nie zmienia zawartości ani kwot', async ({ page, workspace }) => {
  await loginThroughApi(page.context(), workspace);
  await prepareCartA(page.context());
  await page.goto('/');
  const cart = new CartView(page);
  await expect(cart.activeCoupon).toHaveText('Brak');
  await cart.applyCoupon('NOPE');
  await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy kupon');
  await expect(cart.activeCoupon).toHaveText('Brak');
  await expect(cart.discount).toHaveText('0,00 zł');
  await expect(cart.total).toHaveText('250,00 zł');
  await expect(page.getByTestId('cart-item-BOOK-100')).toContainText('BOOK-100');
  await expect(page.getByTestId('cart-item-MUG-050')).toContainText('MUG-050');
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await expect(page.getByTestId('cart-quantity-MUG-050')).toHaveValue('1');
});

test('[SC-06] [legacy] usunięcie kubka zostawia dwie książki za 200 zł', async ({ page, workspace }) => {
  await loginThroughApi(page.context(), workspace);
  await prepareCartA(page.context());
  await page.goto('/');
  const cart = new CartView(page);
  await expect(cart.total).toHaveText('250,00 zł');
  await cart.remove('MUG-050');
  await expect(page.getByTestId('cart-item-MUG-050'), 'ORACLE:SC06-REMOVED').toHaveCount(0);
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await expect(cart.total, 'ORACLE:SC06-TOTAL').toHaveText('200,00 zł');
  await expect(cart.discount).toHaveText('0,00 zł');
});
