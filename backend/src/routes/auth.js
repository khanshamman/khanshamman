import { Router } from 'express';
import { register, login, getMe, getPendingUsers, getPendingUsersCount, approveUser, rejectUser } from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

// Admin user management routes
router.get('/users/pending', authenticate, requireAdmin, getPendingUsers);
router.get('/users/pending/count', authenticate, requireAdmin, getPendingUsersCount);
router.put('/users/:id/approve', authenticate, requireAdmin, approveUser);
router.delete('/users/:id/reject', authenticate, requireAdmin, rejectUser);

export default router;

