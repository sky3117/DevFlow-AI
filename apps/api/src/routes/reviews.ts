import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '@devflow/db';
import { apiLimiter } from '../middleware/rateLimiter';

export const reviewsRouter = Router();

// List reviews for current org
reviewsRouter.get('/', apiLimiter, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.orgId) {
      res.json({ success: true, data: [] });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Get single review
reviewsRouter.get('/:id', apiLimiter, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});
