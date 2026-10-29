import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../app/server.mjs';

describe('QualityCart HTTP contracts', () => {
  let server;
  let origin;
  const token = 'contract-test-control';
  before(async () => {
    server = createServer({ controlToken: token });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });
  async function call(route, { method = 'GET', data, cookie, control = false } = {}) {
    const response = await fetch(`${origin}${route}`, {
      method,
      headers: { ...(data ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(control ? { 'x-qc-control': token } : {}) },
      body: data ? JSON.stringify(data) : undefined,
    });
    return { response, status: response.status, value: await response.json() };
  }
  async function workspace(options = {}) {
    const created = await call('/__control/workspaces', { method: 'POST', data: options, control: true });
    assert.equal(created.status, 201);
    const id = created.value.id;
    let cookie = `qc_workspace=${id}`;
    return {
      id,
      get cookie() { return cookie; },
      call: (route, options) => call(route, { ...options, cookie }),
      async login() {
        const login = await call('/api/login', { method: 'POST', cookie, data: created.value.user });
        assert.equal(login.status, 200);
        cookie += `; ${login.response.headers.getSetCookie()[0].split(';')[0]}`;
      },
      inspect: () => call(`/__control/workspaces/${id}`, { control: true }),
      release: () => call(`/__control/workspaces/${id}/release`, { method: 'POST', control: true }),
      remove: () => call(`/__control/workspaces/${id}`, { method: 'DELETE', control: true }),
    };
  }
  async function cartA(ws) {
    await ws.login();
    assert.equal((await ws.call('/api/cart/items', { method: 'POST', data: { sku: 'BOOK-100', quantity: 2 } })).status, 200);
    const added = await ws.call('/api/cart/items', { method: 'POST', data: { sku: 'MUG-050', quantity: 1 } });
    assert.equal(added.value.totalMinor, 25000);
  }
  async function couponDone(ws) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const state = await ws.call('/api/cart');
      if (!state.value.pending) return state.value;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Coupon did not settle');
  }

  it('identifies the service and protects its control API', async () => {
    assert.deepEqual((await call('/healthz')).value, { app: 'qualitycart', version: '0.1.0' });
    assert.equal((await call('/__control/workspaces', { method: 'POST', data: {} })).status, 403);
    assert.equal((await call('/__control/workspaces', { method: 'POST', data: { profile: 'unknown' }, control: true })).status, 400);
  });
  it('rejects bad credentials and binds a session to its own workspace', async () => {
    const a = await workspace();
    const b = await workspace();
    assert.equal((await a.call('/api/login', { method: 'POST', data: { email: 'qa@example.test', password: 'wrong' } })).status, 401);
    assert.equal((await a.call('/api/cart')).status, 401);
    await a.login();
    assert.equal((await a.call('/api/session')).value.email, 'qa@example.test');
    const stolenSession = a.cookie.split(';')[1];
    assert.equal((await call('/api/cart', { cookie: `qc_workspace=${b.id};${stolenSession}` })).status, 401);
    await a.remove(); await b.remove();
  });
  it('calculates exact integer amounts and rejects NOPE without changing any cart value', async () => {
    const ws = await workspace();
    await cartA(ws);
    const before = (await ws.call('/api/cart')).value;
    assert.deepEqual(before.items.map(item => [item.sku, item.quantity]), [['BOOK-100', 2], ['MUG-050', 1]]);
    assert.equal(before.subtotalMinor, 25000);
    assert.equal(before.discountMinor, 0);
    assert.equal((await ws.call('/api/cart/coupon', { method: 'POST', data: { code: 'NOPE' } })).status, 400);
    assert.deepEqual((await ws.call('/api/cart')).value, before);
    await ws.call('/api/cart/coupon', { method: 'POST', data: { code: 'SAVE10' } });
    const settled = await couponDone(ws);
    assert.equal(settled.discountMinor, 2500);
    assert.equal(settled.totalMinor, 22500);
    assert.equal(settled.coupon, 'SAVE10');
    await ws.remove();
  });
  it('removes only the requested SKU and rejects zero, fractional and excessive quantities unchanged', async () => {
    const ws = await workspace();
    await cartA(ws);
    const before = (await ws.call('/api/cart')).value;
    for (const quantity of [0, -1, 1.5, 100, '2']) {
      assert.equal((await ws.call('/api/cart/items/BOOK-100', { method: 'PATCH', data: { quantity } })).status, 400);
      assert.deepEqual((await ws.call('/api/cart')).value, before);
    }
    const removed = await ws.call('/api/cart/items/MUG-050', { method: 'DELETE' });
    assert.equal(removed.value.totalMinor, 20000);
    assert.deepEqual(removed.value.items.map(item => item.sku), ['BOOK-100']);
    await ws.remove();
  });
  it('retains immutable order snapshots and keeps namespaces independent after cleanup', async () => {
    const a = await workspace();
    const b = await workspace();
    await cartA(a); await cartA(b);
    await a.call('/api/cart/coupon', { method: 'POST', data: { code: 'SAVE10' } });
    await couponDone(a);
    const order = (await a.call('/api/orders', { method: 'POST' })).value;
    assert.match(order.id, /^QC-/);
    assert.equal(order.totalMinor, 22500);
    await a.call('/api/cart/items/MUG-050', { method: 'DELETE' });
    assert.deepEqual((await a.call(`/api/orders/${order.id}`)).value, order);
    assert.equal((await b.call(`/api/orders/${order.id}`)).status, 404);
    await a.remove();
    assert.equal((await a.inspect()).status, 404);
    assert.equal((await b.call('/api/cart')).value.totalMinor, 25000);
    await b.remove();
  });
  it('changes catalog order without changing identities or prices', async () => {
    const normal = await workspace();
    const shifted = await workspace({ profile: 'layout-shift' });
    await normal.login(); await shifted.login();
    const a = (await normal.call('/api/catalog')).value;
    const b = (await shifted.call('/api/catalog')).value;
    assert.equal(a[0].sku, 'BOOK-100');
    assert.equal(b[0].sku, 'MUG-050');
    assert.deepEqual([...b].reverse(), a);
    await normal.remove(); await shifted.remove();
  });
  it('holds gated repricing until explicit release and emits ordered evidence', async () => {
    const ws = await workspace({ profile: 'gated-demo' });
    await cartA(ws);
    const pending = await ws.call('/api/cart/coupon', { method: 'POST', data: { code: 'SAVE10' } });
    assert.equal(pending.status, 202);
    assert.equal(pending.value.pending, true);
    assert.equal(pending.value.totalMinor, 25000);
    assert.equal((await ws.call('/api/orders', { method: 'POST' })).status, 409);
    const state = (await ws.inspect()).value;
    assert.equal(state.gateClosed, true);
    assert.ok(state.events.some(event => event.type === 'coupon:pending' && event.gateClosed));
    const released = (await ws.release()).value;
    assert.equal(released.totalMinor, 22500);
    assert.equal(released.pending, false);
    await ws.remove();
    const abandoned = await workspace({ profile: 'gated-demo' });
    await cartA(abandoned);
    await abandoned.call('/api/cart/coupon', { method: 'POST', data: { code: 'SAVE10' } });
    await abandoned.remove();
    assert.equal((await abandoned.inspect()).status, 404);
  });
  it('slow-coupon leaves a real pending window and completes with correct amounts', async () => {
    const ws = await workspace({ profile: 'slow-coupon' });
    await cartA(ws);
    const started = performance.now();
    await ws.call('/api/cart/coupon', { method: 'POST', data: { code: 'SAVE10' } });
    assert.equal((await ws.call('/api/cart')).value.pending, true);
    const final = await couponDone(ws);
    assert.ok(performance.now() - started >= 1150);
    assert.equal(final.totalMinor, 22500);
    await ws.remove();
  });
  for (const fault of ['F-01', 'F-02', 'F-03', 'F-04']) {
    it(`${fault} activates only when its targeted operation runs`, async () => {
      const ws = await workspace({ fault });
      await cartA(ws);
      assert.equal((await ws.inspect()).value.events.filter(event => event.type === 'fault:activated').length, 0);
      if (fault === 'F-01') {
        await ws.call('/api/cart/coupon', { method: 'POST', data: { code: 'SAVE10' } });
        const cart = await couponDone(ws);
        assert.equal(cart.coupon, 'SAVE10'); assert.equal(cart.discountMinor, 0); assert.equal(cart.totalMinor, 25000);
      }
      if (fault === 'F-02') {
        const cart = (await ws.call('/api/cart/items/MUG-050', { method: 'DELETE' })).value;
        assert.equal(cart.items.length, 2); assert.equal(cart.totalMinor, 25000);
      }
      if (fault === 'F-03') {
        const order = (await ws.call('/api/orders', { method: 'POST' })).value;
        assert.equal(order.totalMinor, 25100);
        assert.equal((await ws.call('/api/cart')).value.totalMinor, 25000);
      }
      if (fault === 'F-04') {
        const result = await ws.call('/api/cart/items/BOOK-100', { method: 'PATCH', data: { quantity: 0 } });
        assert.equal(result.status, 200); assert.equal(result.value.items[0].quantity, 0);
      }
      const activated = (await ws.inspect()).value.events.filter(event => event.type === 'fault:activated');
      assert.deepEqual(activated.map(event => event.fault), [fault]);
      await ws.remove();
    });
  }
});
