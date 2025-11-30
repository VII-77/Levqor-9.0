/**
 * Levqor V12.12 Enterprise - Client-Side Logging Utility
 * Lightweight abstraction for frontend error tracking and monitoring.
 */

import { getApiBase } from '@/lib/api-config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEvent {
  level: LogLevel;
  message: string;
  timestamp: string;
  page?: string;
  userAgent?: string;
  context?: Record<string, any>;
}

/**
 * Client-side logger for frontend error tracking.
 * 
 * This is a lightweight abstraction that can be extended to send
 * error events to the backend or third-party monitoring services.
 * 
 * Usage:
 *   import { logError, logWarning, logInfo } from '@/lib/client-logger';
 *   
 *   try {
 *     // risky operation
 *   } catch (error) {
 *     logError('Checkout failed', { error, step: 'payment' });
 *   }
 */

/**
 * Internal logging function - can be extended to send to backend.
 */
function sendLog(event: LogEvent): void {
  // For now, log to console with structured format
  const logFn = console[event.level] || console.log;
  logFn(`[${event.timestamp}] ${event.level.toUpperCase()}: ${event.message}`, event.context || {});
  
  // TODO: Future enhancement - Send to backend logging endpoint
  // Example:
  // const apiBase = getApiBase();
  // if (apiBase) {
  //   fetch(`${apiBase}/api/logs/client`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(event),
  //   }).catch(() => {
  //     // Silently fail - don't break user experience for logging
  //   });
  // }
}

/**
 * Create a log event with metadata.
 */
function createLogEvent(
  level: LogLevel,
  message: string,
  context?: Record<string, any>
): LogEvent {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    context,
  };
}

/**
 * Log an informational message.
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  sendLog(createLogEvent('info', message, context));
}

/**
 * Log a warning message.
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  sendLog(createLogEvent('warn', message, context));
}

/**
 * Log an error message.
 * 
 * Use this for caught exceptions, API failures, or unexpected states.
 */
export function logError(message: string, context?: Record<string, any>): void {
  sendLog(createLogEvent('error', message, context));
}

/**
 * Log a debug message (only in development).
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    sendLog(createLogEvent('debug', message, context));
  }
}

/**
 * Track a user action or event.
 * 
 * Use this for analytics-style events (page views, button clicks, etc.).
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  logInfo(`Event: ${eventName}`, properties);
  
  // TODO: Future enhancement - Send to analytics service
  // Example:
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', eventName, properties);
  // }
}

/**
 * Global error handler hook.
 * Call this in your root layout or _app.tsx to catch unhandled errors.
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('error', (event) => {
    logError('Unhandled error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.toString(),
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled promise rejection', {
      reason: event.reason?.toString(),
    });
  });
}

// Verification: Import this module in a Next.js page and call logInfo('Test')
