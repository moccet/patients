"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import { NEXT_PUBLIC_API_BASE } from "@/lib/env";

export type ApiError = {
  status: number;
  body: unknown;
};

/**
 * Fetch wrapper that attaches the current Supabase access token as a
 * Bearer header. Throws an ApiError on non-2xx.
 *
 * The backend is on a different origin (production: thewellnesslondon.com,
 * dev: localhost:3000) so we ship the token in the header rather than rely
 * on cookies. CORS is opened explicitly for our origin in
 * `thewellness/src/lib/api/cors.ts`.
 */
export async function api<T = unknown>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  headers.set("accept", "application/json");
  // For FormData bodies the browser auto-sets multipart Content-Type with
  // its boundary token — never override that, or the server can't parse.
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (init?.body && !headers.has("content-type") && !isFormData) {
    headers.set("content-type", "application/json");
  }

  if (!init?.skipAuth) {
    const supabase = getBrowserSupabase();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http")
    ? path
    : `${NEXT_PUBLIC_API_BASE}/api/v1/me${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "omit",
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    const err: ApiError = { status: res.status, body };
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
