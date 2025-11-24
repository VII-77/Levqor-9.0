/**
 * AI Configuration for Levqor X
 * 
 * CRITICAL: This is configuration only. Actual AI calls are handled server-side
 * and must respect cost & safety constraints.
 * 
 * All AI interactions go through backend API endpoints that implement:
 * - Rate limiting
 * - Cost tracking
 * - Content filtering
 * - Audit logging
 */

export const AI_MODELS = {
  chat: 'gpt-4.1-mini',
  heavy: 'gpt-4.1',
} as const

export const AI_MAX_TOKENS = {
  chat: 500,
  workflow: 1000,
  debug: 800,
  onboarding: 600,
} as const

export const AI_TIMEOUT_MS = 15000

export const AI_ENDPOINTS = {
  chat: '/api/ai/chat',
  workflow: '/api/ai/workflow',
  debug: '/api/ai/debug',
  onboarding: '/api/ai/onboarding/next-step',
} as const

export type AIEndpointKey = keyof typeof AI_ENDPOINTS
