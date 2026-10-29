import { test, expect } from '../fixtures/workshop.fixture';

// Deliberately long, with duplicated setup. The order oracle is already strong before LAB-08.
test('[SC-07] [legacy] zamówienie zapisuje produkty, ilości i kwotę po rabacie', async ({ page, workspace }) => {
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
  await page.getByTestId('coupon-code').fill('SAVE10');
  await page.getByTestId('coupon-apply').click();
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
