import { createClient } from '@/utils/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug
  // issues with sessions being lost.

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Senior Fix: If we have an AuthApiError related to Refresh Token, we MUST clear the session
  if (error && error.name === 'AuthApiError') {
    console.warn("Auth Middleware: Session invalid, redirecting to login.", error.message);
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    
    // Clear all sb- cookies on the way out to stop the refresh loop
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith('sb-')) {
            response.cookies.delete(cookie.name)
        }
    })
    return response
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })
    return response
  }

  // Role-based access control & Impersonation Handling
  if (user) {
    const cookieStore = request.cookies;
    const impersonationId = cookieStore.get("impersonation_user_id")?.value;

    // Fetch REAL profile role directly from DB for security
    const { data: realProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const realRole = realProfile?.role;
    let effectiveRole = realRole;
    const effectiveUserId = user.id;

    // Security check for impersonation
    if (impersonationId) {
        if (realRole !== 'admin') {
            // Non-admin trying to impersonate? Clear it immediately.
            const response = NextResponse.redirect(new URL(request.url))
            supabaseResponse.cookies.getAll().forEach((cookie) => {
                response.cookies.set(cookie.name, cookie.value, cookie)
            })
            response.cookies.delete("impersonation_user_id")
            return response
        }

        // Fetch the target user's role
        const { data: targetProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", impersonationId)
          .single();
        
        if (targetProfile) {
            effectiveRole = targetProfile.role;
        } else {
            const response = NextResponse.redirect(new URL(request.url))
            supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie.name, cookie.value, cookie))
            response.cookies.delete("impersonation_user_id")
            return response
        }
    }

    const path = request.nextUrl.pathname

    // Define role-to-path mapping
    const rolePaths: Record<string, string> = {
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent'
    };

    // Check if the current path starts with a role-restricted prefix
    const restrictedPrefixes = Object.values(rolePaths);
    const targetPrefix = restrictedPrefixes.find(p => path.startsWith(p));

    if (targetPrefix) {
        const allowedRole = Object.keys(rolePaths).find(k => rolePaths[k] === targetPrefix);
        
        // Admins can ALWAYS access admin routes, even when shadowing.
        // Otherwise, the effectiveRole must match the path.
        if (effectiveRole !== allowedRole && realRole !== 'admin') {
            const response = NextResponse.redirect(new URL('/unauthorized', request.url))
            supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie.name, cookie.value, cookie))
            return response
        }
    }
  } else {
    // Session gone? Clear shadow cookie.
    if (request.cookies.has("impersonation_user_id")) {
        supabaseResponse.cookies.delete("impersonation_user_id");
    }
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
