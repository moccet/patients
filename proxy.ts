import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/auth/sign-in", "/auth/callback"];

/**
 * Auth gate. Refreshes the Supabase session cookie on every request, then
 * redirects unauthenticated traffic on protected paths to /auth/sign-in.
 *
 * Pattern from supabase/ssr docs: we MUST return the same response object
 * that the createServerClient `cookies.setAll` callback wrote into,
 * otherwise the refreshed cookies don't make it back to the browser and
 * sessions silently expire.
 */
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Rebuild the response so refreshed cookies propagate.
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const signIn = req.nextUrl.clone();
    signIn.pathname = "/auth/sign-in";
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }
  if (user && pathname.startsWith("/auth/sign-in")) {
    const home = req.nextUrl.clone();
    home.pathname = "/home";
    home.search = "";
    return NextResponse.redirect(home);
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static, _next/image, favicon
     * - any file with an extension (so static assets pass through)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
