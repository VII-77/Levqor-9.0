/**
 * Levqor Frontend Telemetry API Route
 * Receives client-side telemetry events and forwards to backend.
 * Logs locally in development, forwards in production.
 */
import { NextRequest, NextResponse } from 'next/server';

interface TelemetryEntry {
  event?: string;
  location?: string;
  endpoint?: string;
  data?: Record<string, unknown>;
  error_type?: string;
  error_msg?: string;
  duration_ms?: number;
  status?: number;
  timestamp?: number;
  extra?: Record<string, unknown>;
}

interface TelemetryPayload {
  events: TelemetryEntry[];
}

const BACKEND_TELEMETRY_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/telemetry/ingest`
  : null;

function logToConsole(entry: TelemetryEntry): void {
  const ts = entry.timestamp || Date.now();
  const type = entry.event ? 'event' : entry.location ? 'error' : 'perf';
  
  const line = JSON.stringify({
    t: type,
    ts,
    ...entry,
  });
  
  console.log(`[TELEMETRY:FE] ${line}`);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as TelemetryPayload;
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }
    
    if (body.events.length > 50) {
      return NextResponse.json(
        { error: 'Too many events in batch (max 50)' },
        { status: 400 }
      );
    }
    
    for (const entry of body.events) {
      logToConsole(entry);
    }
    
    if (BACKEND_TELEMETRY_URL && process.env.NODE_ENV === 'production') {
      try {
        await fetch(BACKEND_TELEMETRY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: body.events }),
        });
      } catch (err) {
        console.warn('[TELEMETRY:FE] Failed to forward to backend:', err);
      }
    }
    
    return NextResponse.json({ 
      ok: true, 
      received: body.events.length,
      forwarded: BACKEND_TELEMETRY_URL && process.env.NODE_ENV === 'production'
    });
    
  } catch (error) {
    console.error('[TELEMETRY:FE] Error processing telemetry:', error);
    return NextResponse.json(
      { error: 'Failed to process telemetry' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    module: 'frontend_telemetry',
    backend_url: BACKEND_TELEMETRY_URL ? 'configured' : 'not_configured',
    timestamp: new Date().toISOString()
  });
}
