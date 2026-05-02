import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '@devflow/db';
import { groqReviewPR } from '../services/groq';
import { fetchPRDiff, postGitHubComment } from '../services/github';

export const webhookRouter = Router();

function verifySignature(payload: Buffer, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

webhookRouter.post('/github', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const event = req.headers['x-github-event'] as string;

  if (!signature) {
    res.status(401).json({ success: false, error: 'Missing signature' });
    return;
  }

  const rawBody = req.body as Buffer;

  if (!verifySignature(rawBody, signature)) {
    res.status(401).json({ success: false, error: 'Invalid signature' });
    return;
  }

  // Acknowledge quickly
  res.json({ success: true, data: { received: true } });

  if (event !== 'pull_request') return;

  try {
    const payload = JSON.parse(rawBody.toString());
    const { action, pull_request: pr, repository: repo, installation } = payload;

    // Only review on opened or synchronize
    if (!['opened', 'synchronize'].includes(action)) return;

    const prNumber = pr.number as number;
    const repoOwner = repo.owner.login as string;
    const repoName = repo.name as string;
    const prTitle = pr.title as string;
    const prUrl = pr.html_url as string;
    const installationId = installation?.id as number | undefined;

    const diff = await fetchPRDiff(repoOwner, repoName, prNumber, installationId);
    const aiResult = await groqReviewPR(diff, prTitle);

    // Find or create org
    const githubOrg = repoOwner;
    let org = await prisma.organization.findUnique({ where: { githubOrg } });
    if (!org) {
      org = await prisma.organization.create({
        data: { name: githubOrg, githubOrg, plan: 'starter', seats: 5 },
      });
    }

    // Save review
    await prisma.review.create({
      data: {
        orgId: org.id,
        prUrl,
        prTitle,
        score: aiResult.score,
        issuesJson: aiResult.issues as unknown as object[],
        summary: aiResult.summary,
        approved: aiResult.approved,
      },
    });

    // Post formatted comment to GitHub PR
    const commentBody = formatReviewComment(aiResult);
    await postGitHubComment(repoOwner, repoName, prNumber, commentBody, installationId);
  } catch (err) {
    console.error('[Webhook] Error processing PR review:', err);
  }
});

function formatReviewComment(result: {
  score: number;
  issues: { file: string; line: number; severity: string; message: string; suggestion: string }[];
  summary: string;
  approved: boolean;
}): string {
  const emoji = result.approved ? '✅' : '❌';
  const scoreColor = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';

  let comment = `## ${emoji} DevFlow AI Code Review\n\n`;
  comment += `**Score:** ${scoreColor} ${result.score}/100\n\n`;
  comment += `### Summary\n${result.summary}\n\n`;

  if (result.issues.length > 0) {
    comment += `### Issues Found (${result.issues.length})\n\n`;
    comment += `| File | Line | Severity | Issue | Suggestion |\n`;
    comment += `|------|------|----------|-------|------------|\n`;
    for (const issue of result.issues) {
      const sev = issue.severity.toUpperCase();
      comment += `| \`${issue.file}\` | ${issue.line} | **${sev}** | ${issue.message} | ${issue.suggestion} |\n`;
    }
  } else {
    comment += `### ✨ No issues found!\n`;
  }

  comment += `\n---\n*Powered by [DevFlow AI](https://devflow.ai)*`;
  return comment;
}
