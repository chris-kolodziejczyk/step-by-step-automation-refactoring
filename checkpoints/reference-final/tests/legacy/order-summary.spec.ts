import { test, expect } from '../fixtures/workshop.fixture';
import { loginThroughApi, prepareCartA } from '../api/workshop-client';
import { CartView } from '../ui/cart';

// LAB-08 reference: setup/actions extracted, persisted-order expectations unchanged.
test('[SC-07] [legacy] zamówienie zapisuje produkty, ilości i kwotę po rabacie', async ({ page, workspace }) => {
  await loginThroughApi(page.context(), workspace);
  await prepareCartA(page.context());
  await page.goto('/');
  const cart = new CartView(page);
  await cart.applyCoupon('SAVE10');
  await expect(page.getByTestId('cart-total')).toHaveText('225,00 zł');
  await expect(page.getByTestId('cart-discount')).toHaveText('25,00 zł');
  await expect(page.getByTestId('coupon-status')).toHaveText('Gotowe');
  await page.getByTestId('order-submit').click();
  await expect(page.getByTestId('order-number')).toHaveText(/^QC-/);
  await expect(page.getByTestId('order-item-BOOK-100')).toContainText('BOOK-100');
  await expect(page.getByTestId('order-item-BOOK-100')).toContainText('2');
  await expect(page.getByTestId('order-item-MUG-050')).toContainText('MUG-050');
  await expect(page.getByTestId('order-item-MUG-050')).toContainText('1');
  await expect(page.getByTestId('order-total'), 'ORACLE:SC07-TOTAL').toHaveText('225,00 zł');
  const orderNumber = await page.getByTestId('order-number').textContent();
  const response = await page.context().request.get(`/api/orders/${encodeURIComponent(orderNumber!)}`);
  expect(response.status()).toBe(200);
  const order = await response.json();
  expect(order.items.map((item: { sku: string; quantity: number }) => ({ sku: item.sku, quantity: item.quantity })))
    .toEqual([{ sku: 'BOOK-100', quantity: 2 }, { sku: 'MUG-050', quantity: 1 }]);
  expect(order.totalMinor, 'ORACLE:SC07-TOTAL').toBe(22500);
  expect(order.discountMinor).toBe(2500);
  // Subsequent cart edits must not rewrite the persisted order snapshot.
  const edit = await page.context().request.delete('/api/cart/items/MUG-050');
  expect(edit.ok()).toBe(true);
  const snapshot = await (await page.context().request.get(`/api/orders/${encodeURIComponent(orderNumber!)}`)).json();
  expect(snapshot.items).toEqual(order.items);
  expect(snapshot.totalMinor).toBe(order.totalMinor);
});
