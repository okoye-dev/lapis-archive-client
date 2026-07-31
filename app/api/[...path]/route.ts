import { NextRequest, NextResponse } from 'next/server';

// Backend configuration - use existing env vars
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:6060';
const REQUEST_TIMEOUT = 30000; // 30 seconds

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

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Build the target URL
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const url = `${BACKEND_URL}/api/${path}${queryString}`;
    
    // Prepare headers - exclude problematic ones
    const headers: Record<string, string> = {};
    const excludeHeaders = ['host', 'content-length', 'connection', 'upgrade'];
    
    request.headers.forEach((value, key) => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Handle request body
    let body: any = undefined;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      // For multipart/form-data, preserve the raw body
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('multipart/form-data')) {
        body = await request.arrayBuffer();
      } else {
        body = await request.arrayBuffer();
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
        // Don't copy problematic headers
        if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
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
