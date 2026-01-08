import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getNotificationCount,
  getUnnotifiedOrders,
  markOrderNotified,
  markAllOrdersNotified,
  getSalesUsers
} from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Sales routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrder);
router.delete('/:id', authenticate, deleteOrder);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.get('/admin/notifications/count', authenticate, requireAdmin, getNotificationCount);
router.get('/admin/notifications/unread', authenticate, requireAdmin, getUnnotifiedOrders);
router.put('/admin/notifications/:id/read', authenticate, requireAdmin, markOrderNotified);
router.put('/admin/notifications/read-all', authenticate, requireAdmin, markAllOrdersNotified);
router.get('/admin/sales-users', authenticate, requireAdmin, getSalesUsers);

export default router;

