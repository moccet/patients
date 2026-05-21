"use client";

import Link from "next/link";
import type { HomePayload } from "@/lib/types";
import {
  editorialDate,
  greetingFor,
  formatVisitDateTime,
  formatRelativeTime,
} from "@/lib/format";

/**
 * Home screen. Sections are rendered only when their data exists — empty
 * sections are omitted entirely per spec §4.3 (no skeleton card chrome).
 *
 * Previously also rendered a wellness snapshot + insights feed; those were
 * removed when the wellness-scoring feature was dropped.
 */
export function Home({ data }: { data: HomePayload }) {
  const now = new Date();
  const greeting = greetingFor(now);
  const name = data.firstName?.trim();

  return (
    <div
      className="tw-pad-mobile tw-padding-bottom-tabs"
      style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 80px" }}
    >
      {/* Greeting */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          {editorialDate(now)}
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Good {greeting}{name ? `, ${name}` : ""}.
        </h1>
      </div>

      {data.nextVisit && <NextVisitSection v={data.nextVisit} />}
    </div>
  );
}

function NextVisitSection({ v }: { v: NonNullable<HomePayload["nextVisit"]> }) {
  const cta = v.intakeRequired && !v.intakeCompleted
    ? { label: "Start pre-consultation form →", href: `/intake/${v.id}` }
    : { label: "View your visit details →", href: "/visits" };

  const relative = formatRelativeTime(v.scheduledAt);

  return (
    <div style={{ marginBottom: 48 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        Your next visit
      </div>
      <div
        className="serif"
        style={{
          fontSize: 24,
          fontWeight: 400,
          lineHeight: 1.3,
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        {formatVisitDateTime(v.scheduledAt)}
        {v.clinician ? ` with ${v.clinician}.` : "."}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--text-2)",
          lineHeight: 1.65,
          marginBottom: 24,
          maxWidth: 540,
        }}
      >
        {relative}.
        {v.intakeRequired && !v.intakeCompleted
          ? " Your pre-consultation form is the one outstanding item."
          : ""}
      </div>
      <Link
        href={cta.href}
        style={{
          display: "inline-block",
          padding: "11px 22px",
          background: "var(--text)",
          color: "white",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.01em",
          borderRadius: 4,
          textDecoration: "none",
        }}
      >
        {cta.label}
      </Link>
    </div>
  );
}
