import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = 'super-secret-key-change-this-in-production'
const key = new TextEncoder().encode(secretKey)

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  
  // Public paths that don't require authentication
  const isPublicPath = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
  
  let payload = null
  if (session) {
    try {
      const { payload: decoded } = await jwtVerify(session, key, { algorithms: ['HS256'] })
      payload = decoded
    } catch (error) {
      // Invalid session
    }
  }

  // If trying to access public paths while logged in, redirect to dashboard
  if (isPublicPath && payload) {
    if (payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    } else {
      return NextResponse.redirect(new URL('/student', request.url))
    }
  }

  // If trying to access protected paths while NOT logged in, redirect to login
  if (!isPublicPath && !payload) {
    // Exclude API routes and static assets from this strict redirect to avoid infinite loops on images/css
    if (!request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.includes('.')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Role-based access control
  if (payload && !isPublicPath) {
    const isStudentPath = request.nextUrl.pathname.startsWith('/student')
    
    if (payload.role === 'STUDENT' && !isStudentPath && !request.nextUrl.pathname.startsWith('/api')) {
      // Students trying to access admin pages
      return NextResponse.redirect(new URL('/student', request.url))
    }
    
    if (payload.role === 'ADMIN' && isStudentPath) {
      // Admins trying to access student pages (they should use admin dashboard)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
