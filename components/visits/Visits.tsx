"use client";

import DOMPurify from "isomorphic-dompurify";
import type { VisitsPayload } from "@/lib/types";
import { formatVisitDateTime, formatRelativeTime, formatPastDate } from "@/lib/format";

export function Visits({ data }: { data: VisitsPayload }) {
  return (
    <div
      className="tw-pad-mobile tw-padding-bottom-tabs"
      style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 80px" }}
    >
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          Your visits
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          A record of every conversation.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            marginTop: 12,
            lineHeight: 1.7,
            maxWidth: 540,
          }}
        >
          After each visit, you receive a plain-English summary of what was
          discussed, what was decided, and what to do next.
        </p>
      </div>

      {data.upcoming.length > 0 && (
        <>
          <h2
            className="serif tw-h2-mobile"
            style={{ fontSize: 17, fontWeight: 400, marginBottom: 14 }}
          >
            Upcoming
          </h2>
          {data.upcoming.map(
            (v) =>
              v && (
                <div
                  key={v.id}
                  style={{
                    marginBottom: 16,
                    padding: "18px 0",
                    borderTop: "1px solid var(--border-2)",
                    borderBottom: "1px solid var(--border-2)",
                  }}
                >
                  <div
                    className="tw-flex-stack-mobile"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <div className="serif" style={{ fontSize: 18, fontWeight: 400 }}>
                        {formatVisitDateTime(v.scheduledAt)}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text-2)",
                          marginTop: 4,
                        }}
                      >
                        {v.clinician ?? "Clinician TBC"} · {v.encounterType}
                      </div>
                      {v.location && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-3)",
                            marginTop: 2,
                          }}
                        >
                          {v.location}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {formatRelativeTime(v.scheduledAt)}
                    </div>
                  </div>
                </div>
              ),
          )}
        </>
      )}

      {data.past.length > 0 && (
        <>
          <h2
            className="serif tw-h2-mobile"
            style={{ fontSize: 17, fontWeight: 400, marginBottom: 14, marginTop: 32 }}
          >
            Past visits
          </h2>
          <div>
            {data.past.map((v) => (
              <PastVisitRow key={v.id} v={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PastVisitRow({ v }: { v: VisitsPayload["past"][number] }) {
  return (
    <div style={{ padding: "22px 0", borderTop: "1px solid var(--border-2)" }}>
      <div
        className="tw-flex-stack-mobile"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <div>
          <div
            className="serif"
            style={{ fontSize: 17, fontWeight: 400, marginBottom: 2 }}
          >
            {v.encounterType}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>
            {formatPastDate(v.scheduledAt)}
            {v.clinician ? ` · ${v.clinician}` : ""}
          </div>
        </div>
        {/* View affordance hidden until sealed (spec §5.2) */}
      </div>
      {v.sealed && v.summary && (
        <div
          style={{
            fontSize: 13,
            color: "var(--text-2)",
            lineHeight: 1.7,
            maxWidth: 600,
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(v.summary, { USE_PROFILES: { html: true } }),
          }}
        />
      )}
    </div>
  );
}
