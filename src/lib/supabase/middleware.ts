import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug
  // issues with sessions being lost.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (user) {
    const role = user.app_metadata?.role as string | undefined
    const path = request.nextUrl.pathname

    // Admin routes protection
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Teacher routes protection
    if (path.startsWith('/teacher') && role !== 'teacher' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Student routes protection
    if (path.startsWith('/student') && role !== 'student' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Settings protection (Admin only for certain sub-paths)
    if (path.startsWith('/settings') && role !== 'admin' && role !== 'teacher') {
       // Students/Parents might have limited settings, but standard ones are restricted
       // return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Redirect context-less /dashboard to specific role dashboard if needed
    // For now, let's keep /dashboard as a landing/shared overview
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but remember that it's a NEW object!

  return supabaseResponse
}
