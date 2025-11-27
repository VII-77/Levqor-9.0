/**
 * Levqor Autopilot Frontend Telemetry
 * Lightweight client-side telemetry collection for Guardian/Brain layer.
 * Sends events to /api/telemetry which forwards to backend.
 */

interface TelemetryEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

interface TelemetryError {
  location: string;
  error_type: string;
  error_msg: string;
  extra?: Record<string, unknown>;
}

interface TelemetryPerformance {
  endpoint: string;
  duration_ms: number;
  status?: number;
}

const TELEMETRY_ENDPOINT = '/api/telemetry';
const GUARDIAN_TELEMETRY_ENDPOINT = '/api/guardian/telemetry/ingest';
const BATCH_INTERVAL_MS = 5000;
const MAX_BATCH_SIZE = 20;

let eventQueue: Array<TelemetryEvent | TelemetryError | TelemetryPerformance> = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apikey', 'auth'];
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(s => keyLower.includes(s));
    
    if (isSensitive && typeof value === 'string' && value.length > 0) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 200) {
      result[key] = value.substring(0, 200) + '...[truncated]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

async function flushQueue(): Promise<void> {
  if (eventQueue.length === 0) return;
  
  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
  
  try {
    const response = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: batch }),
    });
    
    if (!response.ok) {
      console.warn('[Telemetry] Failed to send batch:', response.status);
    }
  } catch (error) {
    console.warn('[Telemetry] Network error:', error);
  }
}

function scheduleBatch(): void {
  if (batchTimer) return;
  
  batchTimer = setTimeout(() => {
    batchTimer = null;
    flushQueue();
  }, BATCH_INTERVAL_MS);
}

function queueEvent(entry: TelemetryEvent | TelemetryError | TelemetryPerformance): void {
  eventQueue.push(entry);
  
  if (eventQueue.length >= MAX_BATCH_SIZE) {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    flushQueue();
  } else {
    scheduleBatch();
  }
}

export function logEvent(event: string, data?: Record<string, unknown>): void {
  const sanitized = data ? sanitizeData(data) : {};
  
  queueEvent({
    event,
    data: sanitized,
    timestamp: Date.now(),
  });
}

export function logError(location: string, error: Error | unknown, extra?: Record<string, unknown>): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  queueEvent({
    location,
    error_type: errorObj.name || 'Error',
    error_msg: errorObj.message?.substring(0, 500) || 'Unknown error',
    extra: extra ? sanitizeData(extra) : undefined,
  } as TelemetryError);
}

export function logPerformance(endpoint: string, durationMs: number, status?: number): void {
  queueEvent({
    endpoint,
    duration_ms: Math.round(durationMs * 100) / 100,
    status,
  } as TelemetryPerformance);
}

export function logBrainCall(language: string, goalLength: number, success: boolean): void {
  logEvent('brain_demo_call', {
    language,
    goal_length: goalLength,
    success,
  });
}

export function logPricingClick(tier: string, billingInterval: string, currency: string): void {
  logEvent('pricing_cta_click', {
    tier,
    billing_interval: billingInterval,
    display_currency: currency,
  });
}

export function logCheckoutClick(purchaseType: string, item: string): void {
  logEvent('checkout_button_click', {
    purchase_type: purchaseType,
    item,
  });
}

export function flushTelemetry(): void {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  flushQueue();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushTelemetry);
  
  window.addEventListener('error', (event) => {
    logError('window.onerror', event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logError('window.unhandledrejection', event.reason, {
      type: 'promise_rejection',
    });
  });
}

/**
 * Wave 2: Direct Guardian Telemetry Logger
 * Sends telemetry directly to database-backed Guardian endpoint.
 * Use for important events that require persistent storage.
 */
export async function guardianLog(
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info', 
  meta: Record<string, unknown> = {}
): Promise<void> {
  try {
    await fetch(GUARDIAN_TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'frontend',
        level,
        message,
        meta: meta ? sanitizeData(meta) : {},
      }),
    });
  } catch (e) {
    console.warn('[Guardian Telemetry] Send failed:', e);
  }
}

export async function guardianLogPerformance(
  endpoint: string,
  durationMs: number,
  statusCode?: number
): Promise<void> {
  try {
    await fetch(GUARDIAN_TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'frontend',
        level: durationMs > 5000 ? 'warning' : 'info',
        event_type: 'performance',
        endpoint,
        duration_ms: durationMs,
        status_code: statusCode,
      }),
    });
  } catch (e) {
    console.warn('[Guardian Telemetry] Performance send failed:', e);
  }
}
