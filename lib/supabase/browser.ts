"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
} from "@/lib/env";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser Supabase client. Singleton: there must only be one in the page
 * so the auth listener doesn't fire twice.
 */
export function getBrowserSupabase() {
  if (cached) return cached;
  cached = createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return cached;
}
