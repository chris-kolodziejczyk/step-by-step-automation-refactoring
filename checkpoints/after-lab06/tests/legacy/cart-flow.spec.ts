import { test, expect } from '../fixtures/workshop.fixture';
import { legacyLogin, legacyAddCartA } from './legacy-utils';

test('[SC-03] [legacy] dodanie CART-A przez UI', async ({ page, workspace }) => {
  await legacyLogin(page, workspace);
  await legacyAddCartA(page);
  await expect(page.getByTestId('cart-item-BOOK-100')).toContainText('BOOK-100');
  await expect(page.getByTestId('cart-item-MUG-050')).toContainText('MUG-050');
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await expect(page.getByTestId('cart-quantity-MUG-050')).toHaveValue('1');
  await expect(page.getByTestId('cart-total'), 'ORACLE:SC03-TOTAL').toHaveText('250,00 zł');
});
