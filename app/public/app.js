const $ = selector => document.querySelector(selector);
const money = minor => `${(minor / 100).toFixed(2).replace('.', ',')} zł`;
const byId = id => $(`[data-testid="${id}"]`);
let pollTimer;
let currentCart;

function element(tag, text, attributes = {}) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}
function alertMessage(message = '') {
  $('#alert').textContent = message;
  $('#alert').hidden = !message;
}
async function api(route, method = 'GET', data) {
  const response = await fetch(route, { method, headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
  return payload;
}
async function action(callback) {
  alertMessage();
  try { return await callback(); } catch (error) { alertMessage(error.message); }
}
function drawCart(cart) {
  currentCart = cart;
  const container = $('#cart-items');
  container.replaceChildren();
  if (!cart.items.length) container.append(element('p', 'Twój koszyk jest pusty.', { class: 'empty' }));
  for (const item of cart.items) {
    const row = element('div', undefined, { 'data-testid': `cart-item-${item.sku}`, class: 'cart-item' });
    const title = element('div', undefined, { class: 'item-title' });
    title.append(element('strong', item.name), element('small', item.sku));
    const controls = element('div', undefined, { class: 'item-controls' });
    const label = element('label', 'Ilość', { for: `quantity-${item.sku}` });
    const qty = element('input', undefined, { id: `quantity-${item.sku}`, type: 'number', step: '1', 'data-testid': `cart-quantity-${item.sku}`, 'aria-label': `Ilość ${item.sku}` });
    qty.value = item.quantity;
    const save = element('button', 'Zapisz', { type: 'button', class: 'secondary small', 'data-testid': `save-${item.sku}`, 'aria-label': `Zapisz ilość ${item.sku}` });
    const saveQuantity = () => action(async () => {
      try { drawCart(await api(`/api/cart/items/${item.sku}`, 'PATCH', { quantity: Number(qty.value) })); }
      catch (error) { drawCart(currentCart); throw error; }
    });
    save.onclick = saveQuantity;
    qty.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); saveQuantity(); } };
    const remove = element('button', 'Usuń', { type: 'button', class: 'text-button', 'data-testid': `remove-${item.sku}`, 'aria-label': `Usuń ${item.sku}` });
    remove.onclick = () => action(async () => drawCart(await api(`/api/cart/items/${item.sku}`, 'DELETE')));
    controls.append(label, qty, save, remove);
    row.append(title, element('span', money(item.unitPriceMinor * item.quantity), { class: 'line-total' }), controls);
    container.append(row);
  }
  for (const [id, value] of [['cart-subtotal', cart.subtotalMinor], ['cart-discount', cart.discountMinor], ['cart-total', cart.totalMinor]]) byId(id).textContent = money(value);
  byId('coupon-active').textContent = cart.coupon ?? 'Brak';
  byId('coupon-status').textContent = cart.pending ? 'Przeliczanie' : 'Gotowe';
  byId('coupon-status').setAttribute('data-state', cart.pending ? 'pending' : 'complete');
  byId('coupon-apply').disabled = cart.pending;
  byId('order-submit').disabled = cart.pending || !cart.items.length;
  clearTimeout(pollTimer);
  if (cart.pending) pollTimer = setTimeout(() => action(async () => drawCart(await api('/api/cart'))), 50);
}
async function loadShop() {
  const session = await api('/api/session');
  $('#user-email').setAttribute('data-testid', 'user-email');
  $('#user-email').textContent = session.email;
  const products = await api('/api/catalog');
  const container = $('#catalog');
  container.replaceChildren();
  for (const product of products) {
    const card = element('article', undefined, { class: 'product', 'data-testid': `product-${product.sku}` });
    const art = element('div', product.sku === 'BOOK-100' ? 'QA' : '{ QA }', { class: `product-art ${product.sku === 'BOOK-100' ? 'book' : 'mug'}`, 'aria-hidden': 'true' });
    card.append(art, element('small', product.sku, { class: 'sku' }), element('h3', product.name), element('p', product.sku === 'BOOK-100' ? 'Miejsce na sprawdzone praktyki i nowe pytania.' : 'Na kawę przed kolejnym zielonym przebiegiem.', { class: 'product-copy' }), element('strong', money(product.unitPriceMinor), { class: 'product-price' }));
    const add = element('button', 'Dodaj do koszyka', { type: 'button' });
    add.onclick = () => action(async () => drawCart(await api('/api/cart/items', 'POST', { sku: product.sku, quantity: 1 })));
    card.append(add);
    container.append(card);
  }
  drawCart(await api('/api/cart'));
  $('#login-panel').hidden = true;
  $('#shop').hidden = false;
}
$('#login-form').onsubmit = event => {
  event.preventDefault();
  return action(async () => { await api('/api/login', 'POST', { email: $('#email').value, password: $('#password').value }); await loadShop(); });
};
$('#coupon-form').onsubmit = event => {
  event.preventDefault();
  return action(async () => drawCart(await api('/api/cart/coupon', 'POST', { code: $('#coupon').value })));
};
$('#order-submit').onclick = () => action(async () => {
  const order = await api('/api/orders', 'POST');
  byId('order-number').textContent = order.id;
  byId('order-total').textContent = money(order.totalMinor);
  $('#order-items').replaceChildren(...order.items.map(item => {
    const row = element('p', `${item.name} · ${item.sku} × ${item.quantity} · ${money(item.unitPriceMinor * item.quantity)}`, { 'data-testid': `order-item-${item.sku}` });
    return row;
  }));
  $('#order').hidden = false;
});
$('#logout').onclick = () => action(async () => {
  await api('/api/logout', 'POST');
  clearTimeout(pollTimer);
  $('#shop').hidden = true;
  $('#user-email').removeAttribute('data-testid');
  $('#order').hidden = true;
  $('#login-panel').hidden = false;
});
$('#new-workspace').onclick = () => action(async () => {
  await api('/api/demo-workspace', 'POST');
  $('#manual-setup').hidden = true;
  $('#email').value = 'qa@example.test';
  $('#password').value = 'Workshop123!';
});
async function init() {
  if (!document.cookie.split(';').some(part => part.trim().startsWith('qc_workspace='))) $('#manual-setup').hidden = false;
  else {
    try { await loadShop(); } catch (error) {
      if (!['Wymagane logowanie'].includes(error.message)) $('#manual-setup').hidden = false;
    }
  }
}
await init();
