import Groq from 'groq-sdk';
import type { AIReviewResult } from '@devflow/shared';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

export async function groqReviewPR(diff: string, prTitle: string): Promise<AIReviewResult> {
  const truncatedDiff = diff.slice(0, 15000); // keep within context limits

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert code reviewer. Analyze this PR diff and return ONLY valid JSON with this exact structure: { "score": number (0-100), "issues": [{"file": string, "line": number, "severity": "critical"|"high"|"medium"|"low"|"info", "message": string, "suggestion": string}], "summary": string, "approved": boolean }',
      },
      {
        role: 'user',
        content: `PR Title: ${prTitle}\n\nDiff:\n${truncatedDiff}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from Groq');

  const result = JSON.parse(content) as AIReviewResult;
  return result;
}

export async function groqGenerateDocs(
  code: string,
  language: string,
  style: 'jsdoc' | 'docstring' | 'markdown'
): Promise<{ docs: string; coverage: number; tokensUsed: number }> {
  const styleInstructions: Record<string, string> = {
    jsdoc: 'Generate JSDoc comments for all functions, classes, and methods.',
    docstring: 'Generate Python-style docstrings for all functions and classes.',
    markdown: 'Generate comprehensive Markdown documentation including function signatures, parameters, return values, and examples.',
  };

  const truncatedCode = code.slice(0, 12000);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a documentation expert. ${styleInstructions[style]} Return ONLY valid JSON: { "docs": string, "coverage": number (0-100, representing percentage of code documented) }`,
      },
      {
        role: 'user',
        content: `Language: ${language}\n\nCode:\n${truncatedCode}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from Groq');

  const result = JSON.parse(content) as { docs: string; coverage: number };
  const tokensUsed = completion.usage?.total_tokens ?? 0;

  return { docs: result.docs, coverage: result.coverage, tokensUsed };
}
