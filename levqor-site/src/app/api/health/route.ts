import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ status: 'healthy', ok: true, ...data });
    }
    
    return NextResponse.json({ status: 'healthy', ok: true, message: 'Frontend healthy' });
  } catch (error) {
    return NextResponse.json({ status: 'healthy', ok: true, message: 'Frontend healthy' });
  }
}
