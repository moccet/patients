"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { ProfilePayload } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => api<ProfilePayload>("/profile"),
  });
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
  };

  return (
    <div
      className="tw-pad-mobile tw-padding-bottom-tabs"
      style={{ maxWidth: 560, margin: "0 auto", padding: "48px 32px 80px" }}
    >
      <header style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          Settings
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{ fontSize: 30, fontWeight: 400, letterSpacing: "-0.02em", margin: 0 }}
        >
          Your account.
        </h1>
      </header>

      <Section title="Account">
        <Row label="Email" value={data?.email ?? "—"} />
        <Row
          label="Member since"
          value={
            data?.memberSince
              ? new Date(data.memberSince).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"
          }
        />
        {data?.tier && <Row label="Tier" value={data.tier} />}
      </Section>

      <Section title="Privacy &amp; security">
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
          Your data is encrypted in transit and at rest. We only share information
          with your clinician when you ask us to in chat. To request export or
          deletion, email{" "}
          <a
            href="mailto:hello@thewellnesslondon.com"
            style={{ color: "var(--text)", textDecoration: "underline" }}
          >
            hello@thewellnesslondon.com
          </a>
          .
        </p>
      </Section>

      <Section title="Session">
        <button
          onClick={onSignOut}
          disabled={signingOut}
          style={{
            padding: "10px 22px",
            background: signingOut ? "var(--panel-2)" : "var(--text)",
            color: signingOut ? "var(--text-3)" : "white",
            border: "none",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            cursor: signingOut ? "default" : "pointer",
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        className="serif tw-h2-mobile"
        style={{ fontSize: 17, fontWeight: 400, marginBottom: 16 }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderTop: "1px solid var(--border-2)",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, color: "var(--text)" }}>{value}</div>
    </div>
  );
}
