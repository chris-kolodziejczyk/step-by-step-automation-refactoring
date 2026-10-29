import type { APIRequestContext, BrowserContext } from '@playwright/test';

export type Workspace = {
  id: string;
  user: { email: string; password: string };
};

export type CartItem = {
  sku: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  coupon: string | null;
  pending: boolean;
};

export class WorkshopClient {
  constructor(private readonly control: APIRequestContext) {}

  async createWorkspace(runId: string): Promise<Workspace> {
    const response = await this.control.post('/__control/workspaces', {
      data: {
        profile: process.env.QC_PROFILE || 'normal',
        fault: process.env.QC_FAULT || null,
        seed: process.env.QC_SEED || 'testwarez-2026',
        runId,
      },
    });
    if (!response.ok()) throw new Error(`CREATE_WORKSPACE: HTTP ${response.status()} ${await response.text()}`);
    return response.json() as Promise<Workspace>;
  }

  async inspectWorkspace(id: string): Promise<unknown> {
    const response = await this.control.get(`/__control/workspaces/${encodeURIComponent(id)}`);
    if (!response.ok()) throw new Error(`INSPECT_WORKSPACE: HTTP ${response.status()}`);
    return response.json();
  }

  async deleteWorkspace(id: string): Promise<void> {
    const response = await this.control.delete(`/__control/workspaces/${encodeURIComponent(id)}`);
    if (!response.ok()) throw new Error(`DELETE_WORKSPACE: HTTP ${response.status()}`);
  }
}

export async function bindWorkspace(context: BrowserContext, baseURL: string, workspace: Workspace): Promise<void> {
  await context.addCookies([{ name: 'qc_workspace', value: workspace.id, url: baseURL }]);
}

export async function loginThroughApi(context: BrowserContext, workspace: Workspace): Promise<void> {
  const response = await context.request.post('/api/login', { data: workspace.user });
  if (!response.ok()) throw new Error(`SETUP_LOGIN: HTTP ${response.status()}`);
}

// The setup intentionally uses the public cart API. It never calls application calculation code.
export async function prepareCartA(context: BrowserContext): Promise<void> {
  for (const item of [{ sku: 'BOOK-100', quantity: 2 }, { sku: 'MUG-050', quantity: 1 }]) {
    const response = await context.request.post('/api/cart/items', { data: item });
    if (!response.ok()) throw new Error(`SETUP_CART: HTTP ${response.status()}`);
  }
}
