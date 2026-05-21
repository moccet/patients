"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function SignInForm() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/home";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = getBrowserSupabase();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div
        className="tw-fade"
        style={{
          padding: "20px 22px",
          border: "1px solid var(--border)",
          borderRadius: 4,
          fontSize: 14,
          color: "var(--text-2)",
          lineHeight: 1.7,
        }}
      >
        We&apos;ve sent a sign-in link to{" "}
        <strong style={{ color: "var(--text)" }}>{email}</strong>. Open it on
        this device to continue.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <label
        htmlFor="email"
        style={{
          display: "block",
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 15,
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: 3,
          color: "var(--text)",
          marginBottom: 18,
        }}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          width: "100%",
          padding: "12px 22px",
          background: status === "sending" ? "var(--panel-2)" : "var(--text)",
          color: status === "sending" ? "var(--text-3)" : "white",
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          cursor: status === "sending" ? "default" : "pointer",
        }}
      >
        {status === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {error && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: "var(--red-soft)",
            color: "var(--red)",
            fontSize: 13,
            borderRadius: 3,
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
}
