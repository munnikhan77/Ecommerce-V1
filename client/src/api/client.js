/**
 * One place for every request to the backend.
 * Components never call fetch() directly — they use `api.*` below.
 */
const TOKEN_KEY = 'admin-token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

const query = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  // shop
  getSettings: () => request('/settings'),
  getCategories: () => request('/categories'),
  getProducts: (params) => request(`/products${query(params)}`),
  getProduct: (slug) => request(`/products/${slug}`),
  createOrder: (order) => request('/orders', { method: 'POST', body: order }),
  trackOrder: (orderNumber) => request(`/orders/track/${orderNumber}`),

  // admin
  login: (password) => request('/auth/login', { method: 'POST', body: { password } }),
  getStats: () => request('/admin/stats'),
  updateSettings: (settings) => request('/admin/settings', { method: 'PUT', body: settings }),
  saveProduct: (product) =>
    product.id
      ? request(`/admin/products/${product.id}`, { method: 'PUT', body: product })
      : request('/admin/products', { method: 'POST', body: product }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  saveCategory: (category) =>
    category.id
      ? request(`/admin/categories/${category.id}`, { method: 'PUT', body: category })
      : request('/admin/categories', { method: 'POST', body: category }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
  getOrders: (params) => request(`/admin/orders${query(params)}`),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
  upload: (files) => {
    const form = new FormData();
    [...files].forEach((f) => form.append('files', f));
    return request('/admin/upload', { method: 'POST', body: form, isForm: true });
  },
};
