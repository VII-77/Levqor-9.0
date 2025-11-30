/**
 * Centralized API Configuration
 * 
 * IMPORTANT: NEXT_PUBLIC_API_URL must be set as an environment variable (not a secret)
 * for it to be available in the browser. Secrets are only available server-side.
 * 
 * For production, the backend is deployed at: https://levqor-backend.replit.app
 */

const PRODUCTION_API_URL = 'https://levqor-backend.replit.app';

export function getApiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || PRODUCTION_API_URL;
  }
  
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }
  
  return PRODUCTION_API_URL;
}

export const API_BASE = getApiBase();
