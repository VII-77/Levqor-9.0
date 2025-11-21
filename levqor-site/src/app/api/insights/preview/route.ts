import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.levqor.ai';
    
    const response = await fetch(`${apiBase}/api/insights/preview`, {
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Insights preview error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
