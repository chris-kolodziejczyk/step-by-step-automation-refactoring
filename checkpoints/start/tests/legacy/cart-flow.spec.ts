import { sharedTest as test, expect } from '../fixtures/workshop.fixture';
import { legacyLogin, legacyAddCartA } from './legacy-utils';

test.describe.serial('legacy cart flow: jawny dług D-01/D-02/D-03', () => {
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
    // D-03: koszyk przygotował inny test. D-02: arbitralny sleep i pojedynczy odczyt.
    await page.getByTestId('coupon-code').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await page.waitForTimeout(200);
    expect(await page.getByTestId('cart-total').textContent(), 'ORACLE:SC04-TOTAL').toBe('225,00 zł');
    expect(await page.getByTestId('cart-discount').textContent(), 'ORACLE:SC04-DISCOUNT').toBe('25,00 zł');
    await expect(page.getByTestId('coupon-active')).toHaveText('SAVE10');
    await expect(page.getByTestId('coupon-status')).toHaveText('Gotowe');
  });
});
