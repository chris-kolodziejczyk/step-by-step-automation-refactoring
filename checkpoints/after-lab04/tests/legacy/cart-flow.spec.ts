import { test, expect } from '../fixtures/workshop.fixture';
import { legacyLogin, legacyAddCartA } from './legacy-utils';
import { loginThroughApi, prepareCartA } from '../api/workshop-client';

test('[SC-03] [legacy] dodanie CART-A przez UI', async ({ page, workspace }) => {
  await legacyLogin(page, workspace);
  await legacyAddCartA(page);
  await expect(page.getByTestId('cart-item-BOOK-100')).toContainText('BOOK-100');
  await expect(page.getByTestId('cart-item-MUG-050')).toContainText('MUG-050');
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await expect(page.getByTestId('cart-quantity-MUG-050')).toHaveValue('1');
  await expect(page.getByTestId('cart-total'), 'ORACLE:SC03-TOTAL').toHaveText('250,00 zł');
});

test('[SC-04] [legacy] SAVE10 obniża wartość CART-A o 25 zł', async ({ page, workspace }) => {
  // Explicit setup. SC-01 and SC-03 still cover UI login and UI additions.
  await loginThroughApi(page.context(), workspace);
  await prepareCartA(page.context());
  await page.goto('/');
  await page.getByTestId('coupon-code').fill('SAVE10');
  await page.getByTestId('coupon-apply').click();
  await expect(page.getByTestId('cart-total'), 'ORACLE:SC04-TOTAL').toHaveText('225,00 zł');
  await expect(page.getByTestId('cart-discount'), 'ORACLE:SC04-DISCOUNT').toHaveText('25,00 zł');
  await expect(page.getByTestId('coupon-active')).toHaveText('SAVE10');
  await expect(page.getByTestId('coupon-status')).toHaveText('Gotowe');
});
