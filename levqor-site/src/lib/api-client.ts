/**
 * API Client - HYPERGROWTH CYCLE 5
 * Centralized API utilities with resilient error handling
 */

import { getApiBase } from './api-config';

const API_BASE = getApiBase();

export async function apiGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`API GET ${endpoint} failed: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API GET ${endpoint} error:`, error);
    return null;
  }
}

export async function apiPost<T>(endpoint: string, data: Record<string, any>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Request failed',
      };
    }
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(`API POST ${endpoint} error:`, error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

export function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  // Try to get from localStorage (user preference)
  try {
    const stored = localStorage.getItem('levqor-language');
    if (stored) return stored;
  } catch (e) {
    // Ignore localStorage errors
  }
  
  // Fallback to browser language
  const browserLang = navigator.language.split('-')[0];
  const supported = ['en', 'de', 'fr', 'es', 'pt', 'it', 'hi', 'ar', 'zh', 'ja', 'ko'];
  
  return supported.includes(browserLang) ? browserLang : 'en';
}
