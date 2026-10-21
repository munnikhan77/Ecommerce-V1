import { db } from '../db/store.js';
import { HttpError } from '../utils/httpError.js';

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const makeOrderNumber = () => `SJ${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

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

  const lines = items.map((item) => {
    const product = db.find('products', (p) => p.id === item.productId && p.active);
    if (!product) throw new HttpError(400, 'A product in your bag is no longer available');
    const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
    if (product.stock < quantity) throw new HttpError(400, `Only ${product.stock} left of ${product.name}`);
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

  // reduce stock
  for (const line of lines) {
    const product = db.find('products', (p) => p.id === line.productId);
    db.update('products', product.id, { stock: product.stock - line.quantity });
  }

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
  const order = db.update('orders', req.params.id, { status });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
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
