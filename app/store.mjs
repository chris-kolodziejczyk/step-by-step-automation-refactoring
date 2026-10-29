import { randomUUID } from 'node:crypto';

export const PROFILES = ['normal', 'slow-coupon', 'layout-shift', 'combined', 'gated-demo'];
export const FAULTS = ['F-01', 'F-02', 'F-03', 'F-04'];
export const USER = Object.freeze({ email: 'qa@example.test', password: 'Workshop123!' });
export const CATALOG = Object.freeze([
  Object.freeze({ sku: 'BOOK-100', name: 'Książka QA', unitPriceMinor: 10000 }),
  Object.freeze({ sku: 'MUG-050', name: 'Kubek QA', unitPriceMinor: 5000 }),
]);

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function createStore() {
  const workspaces = new Map();
  function event(ws, type, details = {}) {
    ws.events.push({ type, at: new Date().toISOString(), ...details });
  }
  function activate(ws, fault) { event(ws, 'fault:activated', { fault }); }
  function get(id) {
    const ws = workspaces.get(id);
    if (!ws) throw new ApiError(404, 'Nie znaleziono przestrzeni');
    return ws;
  }
  function totals(ws) {
    const subtotalMinor = ws.items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
    const discountMinor = ws.coupon === 'SAVE10' && !ws.ignoredCoupon ? Math.floor(subtotalMinor / 10) : 0;
    return { subtotalMinor, discountMinor, totalMinor: subtotalMinor - discountMinor };
  }
  function cart(ws) {
    return { items: structuredClone(ws.items), ...totals(ws), coupon: ws.coupon, pending: ws.pending };
  }
  function create(options = {}) {
    const { profile = 'normal', fault = null, seed = 'testwarez-2026', runId = 'manual' } = options;
    if (!PROFILES.includes(profile)) throw new ApiError(400, 'Nieznany profil');
    if (fault !== null && !FAULTS.includes(fault)) throw new ApiError(400, 'Nieznany defekt');
    const ws = {
      id: randomUUID(), profile, fault, seed, runId, items: [], coupon: null,
      ignoredCoupon: false, pending: false, gateClosed: profile === 'gated-demo',
      session: null, events: [], orders: new Map(), timer: null, completeCoupon: null,
    };
    event(ws, 'workspace:created', { profile, fault, seed, runId });
    workspaces.set(ws.id, ws);
    return { id: ws.id, user: { ...USER }, profile, fault, seed, runId };
  }
  function remove(id) {
    const ws = get(id);
    if (ws.timer) clearTimeout(ws.timer);
    ws.completeCoupon = null;
    workspaces.delete(id);
  }
  function inspect(id) {
    const ws = get(id);
    return {
      id: ws.id, profile: ws.profile, fault: ws.fault, runId: ws.runId,
      seed: ws.seed, gateClosed: ws.gateClosed, cart: cart(ws),
      orders: structuredClone([...ws.orders.values()]), events: structuredClone(ws.events),
    };
  }
  function requireUser(ws, token) {
    if (!ws.session || !token || ws.session !== token) throw new ApiError(401, 'Wymagane logowanie');
  }
  function login(ws, email, password) {
    if (email !== USER.email || password !== USER.password) throw new ApiError(401, 'Nieprawidłowe dane logowania');
    ws.session = randomUUID();
    event(ws, 'session:created');
    return ws.session;
  }
  function checkPending(ws) {
    if (ws.pending) throw new ApiError(409, 'Trwa przeliczanie koszyka');
  }
  function validateQuantity(ws, quantity) {
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99) return;
    if (ws.fault === 'F-04' && quantity === 0) { activate(ws, 'F-04'); return; }
    throw new ApiError(400, 'Ilość musi być liczbą od 1 do 99');
  }
  function addItem(ws, sku, quantity) {
    checkPending(ws);
    const product = CATALOG.find(item => item.sku === sku);
    if (!product) throw new ApiError(404, 'Nieznany produkt');
    const existing = ws.items.find(item => item.sku === sku);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    validateQuantity(ws, quantity);
    validateQuantity(ws, nextQuantity);
    if (existing) existing.quantity = nextQuantity;
    else ws.items.push({ ...product, quantity });
    event(ws, 'cart:item-added', { sku, quantity });
    return cart(ws);
  }
  function setQuantity(ws, sku, quantity) {
    checkPending(ws);
    const item = ws.items.find(row => row.sku === sku);
    if (!item) throw new ApiError(404, 'Nie znaleziono pozycji');
    validateQuantity(ws, quantity);
    item.quantity = quantity;
    event(ws, 'cart:quantity-changed', { sku, quantity });
    return cart(ws);
  }
  function deleteItem(ws, sku) {
    checkPending(ws);
    const item = ws.items.find(row => row.sku === sku);
    if (!item) throw new ApiError(404, 'Nie znaleziono pozycji');
    if (ws.fault === 'F-02') activate(ws, 'F-02');
    else ws.items = ws.items.filter(row => row.sku !== sku);
    event(ws, 'cart:item-removed', { sku });
    return cart(ws);
  }
  function applyCoupon(ws, code) {
    checkPending(ws);
    if (code !== 'SAVE10') throw new ApiError(400, 'Nieprawidłowy kupon');
    if (!ws.items.length) throw new ApiError(400, 'Koszyk jest pusty');
    ws.pending = true;
    event(ws, 'coupon:pending', { code, gateClosed: ws.gateClosed });
    ws.completeCoupon = () => {
      if (!workspaces.has(ws.id)) return;
      ws.coupon = code;
      if (ws.fault === 'F-01') { ws.ignoredCoupon = true; activate(ws, 'F-01'); }
      ws.pending = false;
      ws.completeCoupon = null;
      event(ws, 'coupon:completed', { code });
    };
    if (!ws.gateClosed) {
      const delay = ['slow-coupon', 'combined'].includes(ws.profile) ? 1200 : 20;
      ws.timer = setTimeout(() => ws.completeCoupon?.(), delay);
    }
    return cart(ws);
  }
  function release(ws) {
    ws.gateClosed = false;
    event(ws, 'coupon:gate-released');
    ws.completeCoupon?.();
    return cart(ws);
  }
  function order(ws) {
    checkPending(ws);
    if (!ws.items.length) throw new ApiError(400, 'Koszyk jest pusty');
    const saved = { id: `QC-${randomUUID().slice(0, 8).toUpperCase()}`, ...cart(ws), createdAt: new Date().toISOString() };
    if (ws.fault === 'F-03') { saved.totalMinor += 100; activate(ws, 'F-03'); }
    delete saved.pending;
    ws.orders.set(saved.id, structuredClone(saved));
    event(ws, 'order:created', { orderId: saved.id });
    return structuredClone(saved);
  }
  return {
    create, get, remove, inspect, cart, requireUser, login,
    addItem, setQuantity, deleteItem, applyCoupon, release, order,
    catalog: ws => structuredClone(['layout-shift', 'combined'].includes(ws.profile) ? [...CATALOG].reverse() : CATALOG),
    close: () => { for (const id of workspaces.keys()) remove(id); },
  };
}
