import { Router } from 'express';
import {
  getAllProducts,
  getActiveProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
} from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Seed endpoint (protected by secret key)
router.post('/seed', seedProducts);

// Public routes (still require auth)
router.get('/', authenticate, getAllProducts);
router.get('/active', authenticate, getActiveProducts);
router.get('/:id', authenticate, getProduct);

// Admin only routes
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;

