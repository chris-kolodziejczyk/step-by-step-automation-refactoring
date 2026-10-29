import { test, expect } from '../fixtures/workshop.fixture';
import { loginThroughApi, prepareCartA } from '../api/workshop-client';
import { CartView } from '../ui/cart';

test('[SC-04] [refactored] SAVE10 obniża wartość CART-A o 25 zł', async ({ page, workspace }) => {
  await loginThroughApi(page.context(), workspace);
  await prepareCartA(page.context());
  await page.goto('/');
  const cart = new CartView(page);
  await cart.applyCoupon('SAVE10');
  await expect(cart.total, 'ORACLE:SC04-TOTAL').toHaveText('225,00 zł');
  await expect(cart.discount, 'ORACLE:SC04-DISCOUNT').toHaveText('25,00 zł');
  await expect(cart.activeCoupon).toHaveText('SAVE10');
  await expect(cart.status).toHaveText('Gotowe');
});
