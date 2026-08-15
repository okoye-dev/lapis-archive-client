import { NextRequest, NextResponse } from 'next/server';

// Backend configuration - use existing env vars
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:6060';
const REQUEST_TIMEOUT = 30000; // 30 seconds
// Only small JSON flows through here (uploads go direct to the bucket), so
// anything bigger is refused.
const MAX_BODY_BYTES = 1_048_576; // 1 MB

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE');
}

// Reads the body, aborting past MAX_BODY_BYTES so a chunked request with no
// content-length can't exhaust memory.
async function readCappedBody(request: NextRequest): Promise<ArrayBuffer> {
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('body too large');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out.buffer;
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Fail the obvious case cheaply; the real ceiling is enforced while
    // reading the body below.
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    // Build the target URL
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const url = `${BACKEND_URL}/api/${path}${queryString}`;

    // Prepare headers - exclude problematic ones
    const headers: Record<string, string> = {};
    // Strip hop-by-hop and forwarding headers so a caller can't spoof origin.
    const excludeHeaders = [
      'host',
      'content-length',
      'connection',
      'upgrade',
      // Session cookies stay here; the backend only reads the Bearer header.
      'cookie',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
      'forwarded',
      'x-real-ip',
    ];

    request.headers.forEach((value, key) => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    let body: ArrayBuffer | undefined = undefined;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        body = await readCappedBody(request);
      } catch {
        return NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        );
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Copy response headers
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        // content-length is dropped too: the body is decompressed here.
        if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      // Handle response body
      const responseBody = await response.text();
      
      return new NextResponse(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[PROXY] Request timeout: ${url}`);
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error(`[PROXY] Error proxying ${method} ${request.url}:`, error);
    
    // Return detailed error in development
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: 'Proxy error',
        details: isDev ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
