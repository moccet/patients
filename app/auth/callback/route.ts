import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Magic-link callback. Supabase redirects the user here with a `code` query
 * param; we exchange it for a session, set the cookies on the response,
 * then forward to the originally requested path.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/home";

  if (!code) {
    const u = new URL("/auth/sign-in", url.origin);
    u.searchParams.set("error", "missing_code");
    return NextResponse.redirect(u);
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const u = new URL("/auth/sign-in", url.origin);
    u.searchParams.set("error", "exchange_failed");
    return NextResponse.redirect(u);
  }

  const dest = new URL(next.startsWith("/") ? next : `/${next}`, url.origin);
  return NextResponse.redirect(dest);
}
