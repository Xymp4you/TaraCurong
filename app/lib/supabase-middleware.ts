import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  let response = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
      !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter(Boolean).join(', ')
    throw new Error(
      `[Middleware] Missing Supabase env var(s): ${missing}. Add them to .env.local (see .env.example) and restart the dev server.`
    )
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // getClaims() verifies the JWT locally (WebCrypto) when the project uses
  // asymmetric signing keys — no network round-trip per navigation like
  // getUser(). Falls back to a network verify with legacy symmetric secrets.
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as
    | { sub?: string; user_metadata?: Record<string, string | undefined> }
    | undefined
  const user = claims?.sub ? { id: claims.sub } : null

  // Get role from JWT metadata first, then fall back to database if needed
  let role = claims?.user_metadata?.role

  if (user && !role) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData) {
      role = userData.role
    }
  }

  // Safety check: Ensure role is valid or default it
  const validRoles = ['admin', 'employer', 'jobseeker']
  const finalRole = role && validRoles.includes(role) ? role : 'jobseeker'

  console.log(`[Middleware] Path: ${pathname} | User: ${user?.id} | Role: ${role} | Final: ${finalRole}`)

  // Protected routes check
  if (pathname.startsWith('/jobseeker') && finalRole !== 'jobseeker') {
    console.log(`[Middleware] Unauthorized Jobseeker access, redirecting to login`)
    return NextResponse.redirect(new URL('/login?role=jobseeker', request.url))
  }
  if (pathname.startsWith('/employer') && finalRole !== 'employer') {
    console.log(`[Middleware] Unauthorized Employer access, redirecting to login`)
    return NextResponse.redirect(new URL('/login?role=employer', request.url))
  }
  if (pathname.startsWith('/admin') && finalRole !== 'admin') {
    console.log(`[Middleware] Unauthorized Admin access, redirecting to login`)
    return NextResponse.redirect(new URL('/login/admin', request.url))
  }

  // Redirect if already logged in and hitting login/signup
  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    const dashboardPath = finalRole === 'admin' ? '/admin/dashboard' :
                         finalRole === 'employer' ? '/employer/dashboard' :
                         '/jobseeker/dashboard'

    console.log(`[Middleware] Logged in user on ${pathname}, redirecting to ${dashboardPath}`)
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }


  return response
}
