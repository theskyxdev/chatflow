import express from 'express';
import {
  getMessages,
  sendMessage,
  markMessageAsSeen,
  markConversationAsSeen,
  searchMessages,
  deleteMessage,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import {
  sendMessageValidator,
  paginationValidator,
  searchValidator,
  mongoIdValidator,
} from '../middleware/validators.js';
import { messageLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/search', searchValidator, searchMessages);
router.get('/:conversationId', paginationValidator, getMessages);
router.post('/', messageLimiter, sendMessageValidator, sendMessage);
router.put('/:id/seen', mongoIdValidator, markMessageAsSeen);
router.put('/conversation/:conversationId/seen', mongoIdValidator, markConversationAsSeen);
router.delete('/:id', mongoIdValidator, deleteMessage);

export default router;
