import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { groqGenerateDocs } from '../services/groq';
import { prisma } from '@devflow/db';
import { docsLimiter } from '../middleware/rateLimiter';

export const docsRouter = Router();

docsRouter.post('/generate', docsLimiter, requireAuth, async (req: AuthRequest, res: Response) => {
  const { code, language, style } = req.body as {
    code?: string;
    language?: string;
    style?: 'jsdoc' | 'docstring' | 'markdown';
  };

  if (!code || !language || !style) {
    res.status(400).json({ success: false, error: 'code, language, and style are required' });
    return;
  }

  const validStyles = ['jsdoc', 'docstring', 'markdown'];
  if (!validStyles.includes(style)) {
    res.status(400).json({ success: false, error: `style must be one of: ${validStyles.join(', ')}` });
    return;
  }

  try {
    const result = await groqGenerateDocs(code, language, style);

    // Log doc generation
    await prisma.docGenerated.create({
      data: {
        userId: req.userId!,
        language,
        tokensUsed: result.tokensUsed,
      },
    });

    res.json({ success: true, data: { docs: result.docs, coverage: result.coverage } });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});
