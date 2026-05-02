import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '@devflow/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export const billingRouter = Router();

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
};

// Create Stripe checkout session
billingRouter.post('/create-checkout-session', apiLimiter, requireAuth, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body as { plan?: string };

  if (!plan || !PRICE_IDS[plan]) {
    res.status(400).json({ success: false, error: 'Invalid plan. Choose starter, pro, or enterprise.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard?billing=success`,
      cancel_url: `${frontendUrl}/dashboard?billing=cancelled`,
      metadata: {
        userId: req.userId!,
        plan,
      },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Stripe webhook handler
billingRouter.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body as Buffer;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    res.status(400).json({ success: false, error: `Webhook error: ${(err as Error).message}` });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, plan } = session.metadata || {};

    if (userId && plan) {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.orgId) {
          const seatsMap: Record<string, number> = { starter: 5, pro: 25, enterprise: 9999 };
          await prisma.organization.update({
            where: { id: user.orgId },
            data: {
              plan: plan as 'starter' | 'pro' | 'enterprise',
              seats: seatsMap[plan] || 5,
            },
          });
        }
      } catch (err) {
        console.error('[Billing] Failed to update org plan:', err);
      }
    }
  }

  res.json({ received: true });
});

// Get billing plans info
billingRouter.get('/plans', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'starter', name: 'Starter', price: 49, seats: 5, description: 'For small teams' },
      { id: 'pro', name: 'Pro', price: 199, seats: 25, description: 'For growing teams' },
      { id: 'enterprise', name: 'Enterprise', price: 999, seats: -1, description: 'Unlimited seats' },
    ],
  });
});
