import rateLimit from 'express-rate-limit';

/** General API rate limit: 100 requests per 15 minutes */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

/** Auth endpoints: 20 requests per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth requests, please try again later.' },
});

/** Docs generation: 30 requests per hour (Groq calls are expensive) */
export const docsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Docs generation rate limit exceeded. Try again later.' },
});

/** Webhook endpoint: 200 per 5 minutes */
export const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Webhook rate limit exceeded.' },
});
