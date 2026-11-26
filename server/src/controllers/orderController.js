import { db } from '../db/store.js';
import { HttpError } from '../utils/httpError.js';

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
// 'cod' = pay on delivery; online payments wait for the shop to check the customer's screenshot
export const PAYMENT_STATUSES = ['awaiting', 'verified', 'rejected'];
const COD = 'Cash on Delivery';

const makeOrderNumber = () => `SJ${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

// direction -1 takes the items out of stock, +1 puts them back (cancel / delete)
function adjustStock(lines, direction) {
  for (const line of lines) {
    const product = db.find('products', (p) => p.id === line.productId);
    if (product) db.update('products', product.id, { stock: Math.max(0, product.stock + direction * line.quantity) });
  }
}

// POST /api/orders  — prices are always taken from the database, never from the browser
export function createOrder(req, res) {
  const { customer = {}, items = [], paymentMethod } = req.body;
  const settings = db.getSettings();

  if (!customer.name || !customer.phone || !customer.address || !customer.city) {
    throw new HttpError(400, 'Name, phone, address and city are required');
  }
  if (!/^9[78]\d{8}$/.test(customer.phone.replace(/\D/g, '').slice(-10))) {
    throw new HttpError(400, 'Please enter a valid Nepali mobile number');
  }
  if (!items.length) throw new HttpError(400, 'Your bag is empty');
  if (!settings.paymentMethods.includes(paymentMethod)) throw new HttpError(400, 'Choose a payment method');

  // QR payments: the customer pays first and uploads a screenshot of it
  const online = paymentMethod !== COD;
  const hasQr = Boolean(settings.paymentDetails?.[paymentMethod]?.qr);
  const proof = /^\/uploads\/proof-[\w.-]+$/.test(req.body.paymentProof ?? '') ? req.body.paymentProof : '';
  if (online && hasQr && !proof) throw new HttpError(400, `Please upload the screenshot of your ${paymentMethod} payment`);

  // the same product can sit in the bag twice (two sizes) — check stock against the combined quantity
  const wanted = {};
  for (const item of items) wanted[item.productId] = (wanted[item.productId] ?? 0) + Math.max(1, Math.min(10, Number(item.quantity) || 1));

  const lines = items.map((item) => {
    const product = db.find('products', (p) => p.id === item.productId && p.active);
    if (!product) throw new HttpError(400, 'A product in your bag is no longer available');
    const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
    if (product.stock < wanted[product.id]) throw new HttpError(400, `Only ${product.stock} left of ${product.name}`);
    return {
      productId: product.id,
      name: product.name,
      image: product.images[0] ?? '',
      price: product.price,
      size: item.size ?? '',
      color: item.color ?? '',
      quantity,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const { insideValley, outsideValley, freeAbove } = settings.shipping;
  const shipping = subtotal >= freeAbove && customer.insideValley ? 0 : customer.insideValley ? insideValley : outsideValley;

  adjustStock(lines, -1);

  const order = db.insert('orders', {
    orderNumber: makeOrderNumber(),
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() ?? '',
      address: customer.address.trim(),
      city: customer.city.trim(),
      insideValley: Boolean(customer.insideValley),
      note: customer.note?.trim() ?? '',
    },
    items: lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod,
    paymentStatus: online ? 'awaiting' : 'cod',
    paymentProof: online ? proof : '',
    paymentRef: online ? String(req.body.paymentRef ?? '').trim().slice(0, 60) : '',
    status: 'pending',
  });

  res.status(201).json(order);
}

// GET /api/orders/track/:orderNumber  — public, used by the thank-you page
export function getOrderByNumber(req, res) {
  const order = db.find('orders', (o) => o.orderNumber === req.params.orderNumber);
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
}

// ---- admin ----
export function listOrders(req, res) {
  const { status } = req.query;
  let orders = [...db.all('orders')].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (status) orders = orders.filter((o) => o.status === status);
  res.json(orders);
}

export function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
  const current = db.find('orders', (o) => o.id === req.params.id);
  if (!current) throw new HttpError(404, 'Order not found');

  // cancelling puts the pieces back on the shelf; un-cancelling takes them out again
  if (status === 'cancelled' && current.status !== 'cancelled') adjustStock(current.items, +1);
  if (status !== 'cancelled' && current.status === 'cancelled') {
    for (const line of current.items) {
      const product = db.find('products', (p) => p.id === line.productId);
      if (product && product.stock < line.quantity) throw new HttpError(400, `Not enough stock of ${line.name} to re-open this order`);
    }
    adjustStock(current.items, -1);
  }

  res.json(db.update('orders', current.id, { status }));
}

// Shop checked the customer's screenshot against its eSewa/Khalti statement
export function updatePaymentStatus(req, res) {
  const { paymentStatus } = req.body;
  if (!PAYMENT_STATUSES.includes(paymentStatus)) throw new HttpError(400, 'Invalid payment status');
  const order = db.find('orders', (o) => o.id === req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.paymentMethod === COD) throw new HttpError(400, 'Cash on Delivery orders are paid at the door');
  res.json(db.update('orders', order.id, { paymentStatus }));
}

// Removes an order completely (e.g. a test order). Stock comes back unless it was delivered or already cancelled.
export function deleteOrder(req, res) {
  const order = db.find('orders', (o) => o.id === req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.status !== 'cancelled' && order.status !== 'delivered') adjustStock(order.items, +1);
  db.remove('orders', order.id);
  res.status(204).end();
}

export function getStats(_req, res) {
  const orders = db.all('orders');
  const active = orders.filter((o) => o.status !== 'cancelled');
  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    revenue: active.reduce((sum, o) => sum + o.total, 0),
    totalProducts: db.all('products').length,
    lowStock: db.all('products').filter((p) => p.stock <= 3).map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
  });
}
