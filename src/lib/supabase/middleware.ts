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
    let effectiveUserId = user.id;

    // Security check for impersonation
    if (impersonationId) {
        if (realRole !== 'admin') {
            // Non-admin trying to impersonate? Clear it immediately.
            const response = NextResponse.redirect(new URL(request.url))
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
            effectiveUserId = impersonationId;
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
        // Find which role is allowed for this prefix
        const allowedRole = Object.keys(rolePaths).find(k => rolePaths[k] === targetPrefix);
        
        // Admins can ALWAYS access admin routes, even when impersonating (it switches context)
        // However, if they are impersonating a student, they should be able to access /student routes
        if (effectiveRole !== allowedRole && realRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
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
