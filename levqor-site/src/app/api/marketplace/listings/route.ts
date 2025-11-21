import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.levqor.ai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const params = new URLSearchParams();
    if (category && category !== 'all') {
      params.append('category', category);
    }
    
    const response = await fetch(
      `${API_BASE}/api/marketplace/listings?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Marketplace listings error:', error);
    return NextResponse.json(
      { ok: false, error: 'fetch_failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE}/api/marketplace/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Marketplace create error:', error);
    return NextResponse.json(
      { ok: false, error: 'creation_failed' },
      { status: 500 }
    );
  }
}
