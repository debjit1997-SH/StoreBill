import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simplified middleware that doesn't actually check auth
// since we're using client-side auth with zustand
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // API routes should be excluded from middleware
  if (path.startsWith("/api")) {
    return NextResponse.next()
  }

  // Static files should be excluded from middleware
  if (path.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

