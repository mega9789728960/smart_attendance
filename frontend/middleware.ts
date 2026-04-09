import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // With JWT-based auth, session management is handled client-side.
  // This middleware simply passes through all requests.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
