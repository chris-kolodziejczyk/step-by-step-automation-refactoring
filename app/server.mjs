import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ApiError, createStore, USER } from './store.mjs';

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
const staticFiles = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };

async function body(req) {
  let value = '';
  for await (const chunk of req) {
    value += chunk;
    if (value.length > 16384) throw new ApiError(413, 'Za duże żądanie');
  }
  if (!value) return {};
  try { return JSON.parse(value); } catch { throw new ApiError(400, 'Nieprawidłowy JSON'); }
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie ?? '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
}
function json(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(data));
}

export function createServer({ controlToken = process.env.QC_CONTROL_TOKEN ?? 'workshop-local-control' } = {}) {
  const store = createStore();
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const route = url.pathname;
      const method = req.method;
      if (method === 'GET' && route === '/healthz') return json(res, 200, { app: 'qualitycart', version: '0.1.0' });
      if (method === 'GET' && staticFiles[route]) {
        const [file, mime] = staticFiles[route];
        const content = await readFile(path.join(publicDir, file));
        res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8`, 'Cache-Control': 'no-store' });
        return res.end(content);
      }
      if (route.startsWith('/__control/')) {
        if (req.headers['x-qc-control'] !== controlToken) throw new ApiError(403, 'Brak dostępu do API kontrolnego');
        if (method === 'POST' && route === '/__control/workspaces') return json(res, 201, store.create(await body(req)));
        const match = route.match(/^\/__control\/workspaces\/([^/]+)(\/release)?$/);
        if (!match) throw new ApiError(404, 'Nie znaleziono zasobu');
        const id = match[1];
        if (method === 'POST' && match[2]) return json(res, 200, store.release(store.get(id)));
        if (method === 'GET' && !match[2]) return json(res, 200, store.inspect(id));
        if (method === 'DELETE' && !match[2]) { store.remove(id); return json(res, 200, { deleted: id }); }
        throw new ApiError(405, 'Niedozwolona metoda');
      }
      if (method === 'POST' && route === '/api/demo-workspace') {
        const workspace = store.create({ runId: 'manual-browser' });
        return json(res, 201, workspace, { 'Set-Cookie': [`qc_workspace=${workspace.id}; Path=/; SameSite=Strict`, 'qc_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'] });
      }
      if (!route.startsWith('/api/')) throw new ApiError(404, 'Nie znaleziono zasobu');
      const cookie = cookies(req);
      const ws = store.get(cookie.qc_workspace);
      if (method === 'POST' && route === '/api/login') {
        const data = await body(req);
        const token = store.login(ws, data.email, data.password);
        return json(res, 200, { email: USER.email }, { 'Set-Cookie': `qc_session=${token}; Path=/; HttpOnly; SameSite=Strict` });
      }
      if (method === 'POST' && route === '/api/logout') {
        ws.session = null;
        return json(res, 200, { loggedOut: true }, { 'Set-Cookie': 'qc_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict' });
      }
      store.requireUser(ws, cookie.qc_session);
      if (method === 'GET' && route === '/api/session') return json(res, 200, { email: USER.email, workspaceId: ws.id });
      if (method === 'GET' && route === '/api/catalog') return json(res, 200, store.catalog(ws));
      if (method === 'GET' && route === '/api/cart') return json(res, 200, store.cart(ws));
      if (method === 'POST' && route === '/api/cart/items') {
        const data = await body(req);
        return json(res, 200, store.addItem(ws, data.sku, data.quantity));
      }
      const item = route.match(/^\/api\/cart\/items\/([^/]+)$/);
      if (method === 'PATCH' && item) return json(res, 200, store.setQuantity(ws, item[1], (await body(req)).quantity));
      if (method === 'DELETE' && item) return json(res, 200, store.deleteItem(ws, item[1]));
      if (method === 'POST' && route === '/api/cart/coupon') return json(res, 202, store.applyCoupon(ws, (await body(req)).code));
      if (method === 'POST' && route === '/api/orders') return json(res, 201, store.order(ws));
      const order = route.match(/^\/api\/orders\/([^/]+)$/);
      if (method === 'GET' && order) {
        const saved = ws.orders.get(order[1]);
        if (!saved) throw new ApiError(404, 'Nie znaleziono zamówienia');
        return json(res, 200, structuredClone(saved));
      }
      throw new ApiError(404, 'Nie znaleziono zasobu');
    } catch (error) {
      json(res, error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.message : 'Błąd serwera' });
      if (!(error instanceof ApiError)) console.error(error);
    }
  });
  server.on('close', () => store.close());
  server.store = store;
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.env.HOST ?? '127.0.0.1';
  const port = Number(process.env.PORT ?? 3100);
  const server = createServer();
  server.listen(port, host, () => console.log(`QualityCart: http://${host}:${port}`));
  function shutdown() { server.close(() => process.exit(0)); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
