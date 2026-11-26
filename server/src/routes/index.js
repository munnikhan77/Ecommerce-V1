import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler as h } from '../utils/httpError.js';
import * as products from '../controllers/productController.js';
import * as categories from '../controllers/categoryController.js';
import * as orders from '../controllers/orderController.js';
import * as settings from '../controllers/settingsController.js';
import * as auth from '../controllers/authController.js';
import * as upload from '../controllers/uploadController.js';

const router = Router();

// ---------- public (shop) ----------
router.get('/settings', h(settings.getSettings));
router.get('/categories', h(categories.listCategories));
router.get('/products', h(products.listProducts));
router.get('/products/:slug', h(products.getProduct));
router.post('/orders', h(orders.createOrder));
router.get('/orders/track/:orderNumber', h(orders.getOrderByNumber));
router.post('/payment-proof', upload.proofUploadMiddleware, h(upload.handleProofUpload));
router.post('/auth/login', h(auth.login));

// ---------- admin only ----------
router.use('/admin', requireAdmin);

router.get('/admin/stats', h(orders.getStats));
router.put('/admin/settings', h(settings.updateSettings));

router.post('/admin/products', h(products.createProduct));
router.put('/admin/products/:id', h(products.updateProduct));
router.delete('/admin/products/:id', h(products.deleteProduct));

router.post('/admin/categories', h(categories.createCategory));
router.put('/admin/categories/:id', h(categories.updateCategory));
router.delete('/admin/categories/:id', h(categories.deleteCategory));

router.get('/admin/orders', h(orders.listOrders));
router.patch('/admin/orders/:id', h(orders.updateOrderStatus));
router.delete('/admin/orders/:id', h(orders.deleteOrder));
router.patch('/admin/orders/:id/payment', h(orders.updatePaymentStatus));

router.post('/admin/upload', upload.uploadMiddleware, h(upload.handleUpload));

export default router;
