const express = require('express');
const { login } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: sa
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai tài khoản hoặc mật khẩu
 */
router.post('/login', login);

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Thông tin user từ token',
    user: req.user,
  });
});

module.exports = router;
