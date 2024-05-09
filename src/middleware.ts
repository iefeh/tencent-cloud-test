import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const cspHeader = `
    default-src * data: mediastream: blob: filesystem: about: ws: wss: 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline'; 
    script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; 
    connect-src * data: blob: 'unsafe-inline';
    img-src * data: blob: 'unsafe-inline'; 
    frame-src * data: blob: ; 
    style-src * data: blob: 'unsafe-inline';
    font-src * data: blob: 'unsafe-inline';
    frame-ancestors * data: blob:;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}

export const config = {
  matcher: '/oauth',
  missing: [
    { type: 'header', key: 'next-router-prefetch' },
    { type: 'header', key: 'purpose', value: 'prefetch' },
  ],
};
