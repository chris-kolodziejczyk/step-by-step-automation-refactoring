import { sharedTest as test, expect } from '../fixtures/workshop.fixture';
import { legacyLogin, legacyAddCartA } from './legacy-utils';

test.describe.serial('legacy cart flow: pozostaje zależność D-03', () => {
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
    await legacyLogin(page, workspace);
    // D-03 is still present. LAB-04 will give this scenario its own cart.
    await page.getByTestId('coupon-code').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('cart-total'), 'ORACLE:SC04-TOTAL').toHaveText('225,00 zł');
    await expect(page.getByTestId('cart-discount'), 'ORACLE:SC04-DISCOUNT').toHaveText('25,00 zł');
    await expect(page.getByTestId('coupon-active')).toHaveText('SAVE10');
    await expect(page.getByTestId('coupon-status')).toHaveText('Gotowe');
  });
});
