"use client";

import Link from "next/link";
import type { HomePayload } from "@/lib/types";
import {
  editorialDate,
  greetingFor,
  formatVisitDateTime,
  formatRelativeTime,
  domainStatusColor,
  formatPastDate,
} from "@/lib/format";

/**
 * Home screen. Sections are rendered only when their data exists — empty
 * sections are omitted entirely per spec §4.3 (no skeleton card chrome).
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

      {data.nextVisit && (
        <NextVisitSection v={data.nextVisit} />
      )}

      {data.wellness && data.wellness.score != null && (
        <WellnessSnapshot w={data.wellness} />
      )}

      {data.insights.length > 0 && <InsightsSection items={data.insights} />}
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

function WellnessSnapshot({ w }: { w: NonNullable<HomePayload["wellness"]> }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 18,
        }}
      >
        <h2
          className="serif tw-h2-mobile"
          style={{ fontSize: 19, fontWeight: 400, margin: 0 }}
        >
          Your wellness this week
        </h2>
        <Link
          href="/health"
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            textDecoration: "none",
          }}
        >
          See all →
        </Link>
      </div>

      <div
        className="tw-flex-stack-mobile"
        style={{
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            Composite score
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div
              className="serif"
              style={{
                fontSize: 56,
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {w.score}
            </div>
            {w.trend != null && (
              <div
                style={{
                  fontSize: 13,
                  color:
                    w.trend < 0
                      ? "var(--red)"
                      : w.trend > 0
                      ? "var(--green)"
                      : "var(--text-3)",
                }}
              >
                {w.trend > 0 ? "+" : ""}
                {w.trend} pts
              </div>
            )}
          </div>
        </div>
        {w.summaryProse && (
          <div
            style={{
              flex: 1,
              fontSize: 13,
              color: "var(--text-2)",
              lineHeight: 1.7,
              maxWidth: 440,
            }}
          >
            {w.summaryProse}
          </div>
        )}
      </div>

      {w.domains.length > 0 && (
        <div
          className="tw-stack-mobile"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            columnGap: 24,
            rowGap: 22,
          }}
        >
          {w.domains.map((d) => (
            <div key={d.name}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    background: domainStatusColor(d.score, d.trend),
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{d.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div
                  className="serif"
                  style={{ fontSize: 22, fontWeight: 400, lineHeight: 1 }}
                >
                  {d.score}
                </div>
                {d.trend != null && (
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        d.trend < 0
                          ? "var(--red)"
                          : d.trend > 0
                          ? "var(--green)"
                          : "var(--text-3)",
                    }}
                  >
                    {d.trend > 0 ? "+" : ""}
                    {d.trend}
                  </div>
                )}
              </div>
              {d.sub && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    marginTop: 5,
                    lineHeight: 1.4,
                  }}
                >
                  {d.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsSection({ items }: { items: HomePayload["insights"] }) {
  return (
    <div>
      <h2
        className="serif tw-h2-mobile"
        style={{ fontSize: 19, fontWeight: 400, marginBottom: 18 }}
      >
        What we noticed
      </h2>
      <div>
        {items.map((ins, i) => (
          <div
            key={ins.id}
            style={{
              padding: "22px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                {formatPastDate(ins.when)}
              </span>
              {ins.domain && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 3,
                    letterSpacing: "0.04em",
                    background:
                      ins.severity === "attention"
                        ? "var(--red-soft)"
                        : ins.severity === "watch"
                        ? "var(--amber-soft)"
                        : "var(--green-soft)",
                    color:
                      ins.severity === "attention"
                        ? "var(--red)"
                        : ins.severity === "watch"
                        ? "var(--amber)"
                        : "var(--green)",
                  }}
                >
                  {ins.domain.toLowerCase()}
                </span>
              )}
            </div>
            <div
              className="serif"
              style={{
                fontSize: 17,
                fontWeight: 400,
                marginBottom: 8,
                letterSpacing: "-0.01em",
              }}
            >
              {ins.title}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-2)",
                lineHeight: 1.7,
                maxWidth: 640,
              }}
            >
              {ins.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
