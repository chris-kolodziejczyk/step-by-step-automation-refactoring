import type { Locator, Page } from '@playwright/test';

// A small UI module handles actions. Business expectations remain visible in each scenario.
export class CartView {
  readonly total: Locator;
  readonly discount: Locator;
  readonly activeCoupon: Locator;
  readonly status: Locator;

  constructor(private readonly page: Page) {
    this.total = page.getByTestId('cart-total');
    this.discount = page.getByTestId('cart-discount');
    this.activeCoupon = page.getByTestId('coupon-active');
    this.status = page.getByTestId('coupon-status');
  }

  async applyCoupon(code: string): Promise<void> {
    await this.page.getByTestId('coupon-code').fill(code);
    await this.page.getByTestId('coupon-apply').click();
  }

  async remove(sku: string): Promise<void> {
    await this.page.getByTestId('remove-' + sku).click();
  }
}
