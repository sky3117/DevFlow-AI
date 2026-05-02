import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { prisma } from '@devflow/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

// Initiate GitHub OAuth
authRouter.get('/github', authLimiter, passport.authenticate('github', { session: false }));

// GitHub OAuth callback
authRouter.get(
  '/github/callback',
  authLimiter,
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as { id: string; email: string | null; role: string };
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// Get current user
authRouter.get('/me', authLimiter, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { org: true },
    });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Logout (client-side token removal, but we provide an endpoint for clarity)
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Logged out' } });
});
