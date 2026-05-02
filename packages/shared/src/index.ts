// Shared types for DevFlow AI platform

export interface Organization {
  id: string;
  name: string;
  githubOrg: string;
  plan: Plan;
  seats: number;
  createdAt: Date;
}

export type Plan = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  orgId: string | null;
  githubId: string;
  email: string | null;
  role: Role;
  createdAt: Date;
}

export type Role = 'admin' | 'member';

export interface Review {
  id: string;
  orgId: string;
  prUrl: string;
  prTitle: string;
  score: number;
  issuesJson: ReviewIssue[];
  summary: string;
  approved: boolean;
  createdAt: Date;
}

export interface ReviewIssue {
  file: string;
  line: number;
  severity: Severity;
  message: string;
  suggestion: string;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface DocGenerated {
  id: string;
  userId: string;
  language: string;
  tokensUsed: number;
  createdAt: Date;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DocGenerateRequest {
  code: string;
  language: string;
  style: 'jsdoc' | 'docstring' | 'markdown';
}

export interface DocGenerateResponse {
  docs: string;
  coverage: number;
}

export interface AIReviewResult {
  score: number;
  issues: ReviewIssue[];
  summary: string;
  approved: boolean;
}

// Stripe plan config
export const PLAN_CONFIG: Record<Plan, { price: number; seats: number; priceId?: string }> = {
  starter: { price: 49, seats: 5 },
  pro: { price: 199, seats: 25 },
  enterprise: { price: 999, seats: Infinity },
};
