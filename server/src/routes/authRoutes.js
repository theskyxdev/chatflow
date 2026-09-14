import express from 'express';
import passport from '../config/passport.js';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  oauthSuccess,
  oauthFailure,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../middleware/validators.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Regular auth routes
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, resetPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/oauth/failure',
    session: false,
  }),
  oauthSuccess
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/api/auth/oauth/failure',
    session: false,
  }),
  oauthSuccess
);

// OAuth failure route
router.get('/oauth/failure', oauthFailure);

export default router;
