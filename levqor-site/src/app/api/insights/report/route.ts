import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.levqor.ai';
    
    const response = await fetch(`${apiBase}/api/insights/report`, {
      method: 'POST',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
