import { Router } from 'express';
import {
  getAdminConversations,
  getConversationMessages,
  getCustomerConversation,
  markConversationRead,
  sendMessage,
} from '../controllers/chatController.js';
import { verifyAdmin, verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/conversation', verifyToken, getCustomerConversation);
router.get('/conversations', verifyToken, verifyAdmin, getAdminConversations);
router.get('/conversations/:conversationId', verifyToken, getConversationMessages);
router.post('/messages', verifyToken, sendMessage);
router.post('/conversations/:conversationId/read', verifyToken, markConversationRead);

export default router;
