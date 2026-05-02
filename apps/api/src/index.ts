import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';

import { authRouter } from './routes/auth';
import { webhookRouter } from './routes/webhook';
import { docsRouter } from './routes/docs';
import { reviewsRouter } from './routes/reviews';
import { billingRouter } from './routes/billing';
import { errorHandler } from './middleware/errorHandler';
import { configurePassport } from './middleware/passport';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

// Raw body for Stripe and GitHub webhooks (must come before json middleware)
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use('/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Configure Passport strategies
configurePassport();
app.use(passport.initialize());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRouter);
app.use('/webhook', webhookRouter);
app.use('/api/docs', docsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/billing', billingRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DevFlow API running on http://localhost:${PORT}`);
});

export default app;
