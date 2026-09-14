import express from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  searchConversations,
} from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';
import {
  createConversationValidator,
  searchValidator,
  mongoIdValidator,
} from '../middleware/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getConversations);
router.get('/search', searchValidator, searchConversations);
router.get('/:id', mongoIdValidator, getConversationById);
router.post('/', createConversationValidator, createConversation);
router.delete('/:id', mongoIdValidator, deleteConversation);

export default router;
