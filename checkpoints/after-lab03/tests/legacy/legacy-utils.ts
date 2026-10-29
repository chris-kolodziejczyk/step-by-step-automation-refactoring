import { expect, type Page } from '@playwright/test';
import type { Workspace } from '../api/workshop-client';

export async function legacyLogin(page: Page, workspace: Workspace): Promise<void> {
  await page.goto('/');
  await page.getByLabel('E-mail', { exact: true }).fill(workspace.user.email);
  await page.getByLabel('Hasło', { exact: true }).fill(workspace.user.password);
  await page.getByRole('button', { name: 'Zaloguj', exact: true }).click();
  await expect(page.getByTestId('user-email')).toHaveText(workspace.user.email);
}

// LAB-03: product identity remains stable when the catalog layout changes.
export async function legacyAddCartA(page: Page): Promise<void> {
  await page.getByTestId('product-BOOK-100').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('1');
  await page.getByTestId('product-BOOK-100').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
  await expect(page.getByTestId('cart-quantity-BOOK-100')).toHaveValue('2');
  await page.getByTestId('product-MUG-050').getByRole('button', { name: 'Dodaj do koszyka', exact: true }).click();
}
