import { db } from '../db/store.js';
import { verifyToken } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';
import { slugify } from '../utils/slugify.js';
import { genderOf } from './categoryController.js';

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  featured: (a, b) => Number(b.featured) - Number(a.featured),
};

// GET /api/products?gender=&category=&q=&sort=&featured=&isNew=&limit=&all=
export function listProducts(req, res) {
  const { gender, category, q, sort = 'featured', featured, isNew, limit, all } = req.query;
  const isAdmin = all && verifyToken(req.headers.authorization?.replace('Bearer ', ''));

  let products = db.all('products');
  if (!isAdmin) products = products.filter((p) => p.active);

  // women / men: products whose category is for them (unisex counts for both)
  if (gender === 'women' || gender === 'men') {
    const ids = new Set(db.all('categories').filter((c) => [gender, 'unisex'].includes(genderOf(c))).map((c) => c.id));
    products = products.filter((p) => ids.has(p.categoryId));
  }
  if (category) {
    const cat = db.find('categories', (c) => c.slug === category);
    products = products.filter((p) => p.categoryId === cat?.id);
  }
  if (q) {
    const term = q.toLowerCase();
    products = products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(term));
  }
  if (featured === 'true') products = products.filter((p) => p.featured);
  if (isNew === 'true') products = products.filter((p) => p.isNew);

  products = [...products].sort(SORTERS[sort] ?? SORTERS.featured);
  if (limit) products = products.slice(0, Number(limit));

  res.json(products);
}

// GET /api/products/:slug  (also returns a few related products)
export function getProduct(req, res) {
  const product = db.find('products', (p) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!product) throw new HttpError(404, 'Product not found');

  const category = db.find('categories', (c) => c.id === product.categoryId) ?? null;
  const related = db
    .all('products')
    .filter((p) => p.active && p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  res.json({ ...product, category, related });
}

function cleanProductInput(body) {
  const product = {
    name: body.name?.trim(),
    categoryId: body.categoryId,
    price: Number(body.price),
    comparePrice: body.comparePrice ? Number(body.comparePrice) : null,
    description: body.description ?? '',
    details: Array.isArray(body.details) ? body.details.filter(Boolean) : [],
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    colors: Array.isArray(body.colors) ? body.colors : [],
    images: Array.isArray(body.images) ? body.images : [],
    // full-body cutout (transparent PNG/WebP) shown in the homepage fitting room
    lookImage: typeof body.lookImage === 'string' ? body.lookImage : '',
    // the clothes alone (no model), shown on the glass cards beside the model
    lookGarment: typeof body.lookGarment === 'string' ? body.lookGarment : '',
    stock: Number(body.stock) || 0,
    featured: Boolean(body.featured),
    isNew: Boolean(body.isNew),
    active: body.active !== false,
  };
  if (!product.name) throw new HttpError(400, 'Product name is required');
  if (!product.price || product.price < 0) throw new HttpError(400, 'Valid price is required');
  return product;
}

function uniqueSlug(name, ignoreId) {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (db.find('products', (p) => p.slug === slug && p.id !== ignoreId)) slug = `${base}-${n++}`;
  return slug;
}

export function createProduct(req, res) {
  const data = cleanProductInput(req.body);
  const product = db.insert('products', { ...data, slug: uniqueSlug(data.name) });
  res.status(201).json(product);
}

export function updateProduct(req, res) {
  const data = cleanProductInput(req.body);
  const product = db.update('products', req.params.id, { ...data, slug: uniqueSlug(data.name, req.params.id) });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
}

export function deleteProduct(req, res) {
  if (!db.remove('products', req.params.id)) throw new HttpError(404, 'Product not found');
  res.status(204).end();
}
