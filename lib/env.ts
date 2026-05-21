/**
 * Required environment variables. Throws at import time on the server if
 * anything is missing so we fail fast rather than 500ing per request.
 *
 * NEXT_PUBLIC_* are inlined at build; SUPABASE_SERVICE_ROLE_KEY is server-only
 * (we don't read it on the client).
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var ${name}`)
  }
  return value
}

// Public — safe to access on client and server
export const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Backend base URL. In production this is the main app's host; in dev we
 * fall back to localhost:3000 (the thewellness app). The trailing /api/v1/me
 * is appended by the api-client.
 */
export const NEXT_PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000'

export function assertPublicSupabaseEnv(): void {
  required('NEXT_PUBLIC_SUPABASE_URL', NEXT_PUBLIC_SUPABASE_URL)
  required('NEXT_PUBLIC_SUPABASE_ANON_KEY', NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
