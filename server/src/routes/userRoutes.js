import express from 'express';
import {
  getCurrentUser,
  getUserById,
  updateProfile,
  uploadAvatar,
  changePassword,
  searchUsers,
  getOnlineUsers,
  getAllUsers,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import {
  updateProfileValidator,
  changePasswordValidator,
  searchValidator,
  mongoIdValidator,
} from '../middleware/validators.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', getCurrentUser);
router.get('/all', getAllUsers); // Add this route - get all users
router.get('/online', getOnlineUsers);
router.get('/search', searchValidator, searchUsers);
router.get('/:id', mongoIdValidator, getUserById);
router.put('/profile', updateProfileValidator, updateProfile);
router.post('/avatar', upload.single('avatar'), handleUploadError, uploadAvatar);
router.put('/password', changePasswordValidator, changePassword);

export default router;
