import { Router } from 'express';
import { changePassword, confirmPasswordReset, login, logout, me, requestPasswordResetCode, updateProfile } from '../controllers/auth.controller.js';
import { googleAuthRedirect, googleAuthCallback, googleAuthStatus } from '../controllers/google-auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createRateLimitMiddleware } from '../middleware/rate-limit.middleware.js';

const router = Router();
const loginRateLimiter = createRateLimitMiddleware({
  keyPrefix: 'auth-login',
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: 'Too many login attempts. Please try again in a few minutes.',
  key: (req, clientKey) => {
    const username = String(req.body?.username || '').trim().toLowerCase();
    return `${clientKey}:${username || 'anonymous'}`;
  },
});

const forgotPasswordRateLimiter = createRateLimitMiddleware({
  keyPrefix: 'auth-forgot-password',
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: 'Bạn đã yêu cầu mã quá nhiều lần. Vui lòng thử lại sau ít phút.',
  key: (req, clientKey) => {
    const username = String(req.body?.username || '').trim().toLowerCase();
    return `${clientKey}:${username || 'anonymous'}`;
  },
});

const resetPasswordRateLimiter = createRateLimitMiddleware({
  keyPrefix: 'auth-reset-password',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Bạn đã nhập mã quá nhiều lần. Vui lòng thử lại sau ít phút.',
});

router.post('/login', loginRateLimiter, login);
router.post('/forgot-password/request', forgotPasswordRateLimiter, requestPasswordResetCode);
router.post('/forgot-password/confirm', resetPasswordRateLimiter, confirmPasswordReset);
router.get('/me', authMiddleware, me);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/change-password', authMiddleware, changePassword);
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);
router.get('/google/status', googleAuthStatus);

export default router;
