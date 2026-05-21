import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
} from "@/lib/env";

/**
 * Supabase server client tied to the current request's cookies.
 *
 * Use in route handlers, server components, and middleware. Reading the
 * session refreshes it if needed and writes the refreshed cookies back.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware refreshes next time.
          }
        },
      },
    },
  );
}
