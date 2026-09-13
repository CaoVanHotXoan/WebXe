import { Router } from 'express';
import { getProfile } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: Lấy thông tin profile hiện tại
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       200: { description: Profile người dùng }
 *       401: { description: Unauthorized khi thiếu, sai hoặc hết hạn cookie }
 */
router.get('/profile', verifyToken, getProfile);

export default router;
