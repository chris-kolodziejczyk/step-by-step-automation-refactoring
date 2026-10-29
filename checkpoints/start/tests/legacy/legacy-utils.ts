import { expect, type Page } from '@playwright/test';
import type { Workspace } from '../api/workshop-client';

export async function legacyLogin(page: Page, workspace: Workspace): Promise<void> {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(workspace.user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(workspace.user.password);
  await page.getByRole('button', { name: 'Zaloguj', exact: true }).click();
  await expect(page.getByTestId('user-email')).toHaveText(workspace.user.email);
}

// Intentionally positional, duplicated and coupled to one catalog layout. LAB-03 repairs this.
export async function legacyAddCartA(page: Page): Promise<void> {
  const products = page.locator('.product');
  await products.nth(0).getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('1');
  await products.nth(0).getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await products.nth(1).getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
}
