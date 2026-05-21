import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div
      className="tw-pad-mobile"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        background: "var(--bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          className="serif"
          style={{
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: "-0.015em",
            marginBottom: 10,
          }}
        >
          The Wellness
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            marginBottom: 28,
            lineHeight: 1.65,
          }}
        >
          Enter your email and we&apos;ll send you a single-use sign-in link.
        </p>
        <Suspense
          fallback={
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
