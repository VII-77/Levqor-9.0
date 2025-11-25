const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.levqor.ai';

function buildTargetUrl(req: Request, params: { path: string[] }): string {
  const reqUrl = new URL(req.url);
  const pathname = '/' + params.path.join('/');
  const search = reqUrl.search;
  return `${API_BASE}${pathname}${search}`;
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const targetUrl = buildTargetUrl(req, params);
  
  try {
    const r = await fetch(targetUrl, {
      headers: {
        'Authorization': req.headers.get('authorization') ?? '',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    
    return new Response(await r.text(), {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') ?? 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'API temporarily unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  const targetUrl = buildTargetUrl(req, params);
  
  try {
    const body = await req.text();
    const r = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('authorization') ?? '',
        'Content-Type': req.headers.get('content-type') ?? 'application/json',
      },
      body,
      signal: AbortSignal.timeout(15000),
    });
    
    return new Response(await r.text(), {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') ?? 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'API temporarily unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
