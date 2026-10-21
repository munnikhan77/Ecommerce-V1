import { db } from '../db/store.js';
import { HttpError } from '../utils/httpError.js';
import { slugify } from '../utils/slugify.js';

// GET /api/categories  — each category also gets its product count
export function listCategories(_req, res) {
  const products = db.all('products').filter((p) => p.active);
  const categories = [...db.all('categories')]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length }));
  res.json(categories);
}

function cleanCategoryInput(body) {
  const name = body.name?.trim();
  if (!name) throw new HttpError(400, 'Category name is required');
  return {
    name,
    slug: slugify(body.slug || name),
    tagline: body.tagline ?? '',
    image: body.image ?? '',
    tone: body.tone || '#d9c2b8',
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export function createCategory(req, res) {
  res.status(201).json(db.insert('categories', cleanCategoryInput(req.body)));
}

export function updateCategory(req, res) {
  const category = db.update('categories', req.params.id, cleanCategoryInput(req.body));
  if (!category) throw new HttpError(404, 'Category not found');
  res.json(category);
}

export function deleteCategory(req, res) {
  const inUse = db.all('products').some((p) => p.categoryId === req.params.id);
  if (inUse) throw new HttpError(400, 'Move or delete the products in this category first');
  if (!db.remove('categories', req.params.id)) throw new HttpError(404, 'Category not found');
  res.status(204).end();
}
