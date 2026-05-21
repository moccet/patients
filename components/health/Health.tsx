"use client";

import { useMemo, useState } from "react";
import type { WellnessPayload, WearablesPayload } from "@/lib/types";
import { PatientTrendCard } from "./PatientTrendCard";
import { Methodology } from "./Methodology";
import { domainStatusColor } from "@/lib/format";

const TREND_CARDS: { metric: string; label: string; unit: string; color: string }[] = [
  { metric: "hrv", label: "HRV (rMSSD)", unit: "ms", color: "#8B2C2C" },
  { metric: "rhr", label: "Resting heart rate", unit: "bpm", color: "#B5803D" },
  { metric: "sleep_duration", label: "Sleep duration", unit: "h", color: "#1E3A5F" },
];

export function Health({
  data,
  wearables,
}: {
  data: WellnessPayload;
  wearables: WearablesPayload;
}) {
  // Default selection = domain with largest negative 30d trend
  const defaultDomain = useMemo(() => {
    const sorted = [...data.domains].sort(
      (a, b) => (a.trend ?? 0) - (b.trend ?? 0),
    );
    return sorted[0]?.name ?? "Cardiovascular";
  }, [data.domains]);

  const [domain, setDomain] = useState(defaultDomain);
  const selected = data.domains.find((d) => d.name === domain) ?? data.domains[0];

  return (
    <div
      className="tw-pad-mobile tw-padding-bottom-tabs"
      style={{ maxWidth: 880, margin: "0 auto", padding: "48px 32px 80px" }}
    >
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          {data.snapshotDate ? `Your health, updated ${data.snapshotDate}` : "Your health"}
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
          Six domains, tracked continuously.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            marginTop: 12,
            lineHeight: 1.7,
            maxWidth: 580,
          }}
        >
          The composite is recalculated nightly. Wearable values and lab results
          feed in as they arrive.
        </p>
      </div>

      {/* Score */}
      {data.score != null && (
        <div style={{ marginBottom: 44 }}>
          <div
            className="tw-flex-stack-mobile"
            style={{ display: "flex", gap: 36, alignItems: "flex-end" }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                }}
              >
                Wellness score
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div
                  className="serif"
                  style={{
                    fontSize: 72,
                    fontWeight: 400,
                    lineHeight: 1,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {data.score}
                </div>
                {data.trend != null && (
                  <div
                    style={{
                      fontSize: 14,
                      color:
                        data.trend < 0
                          ? "var(--red)"
                          : data.trend > 0
                          ? "var(--green)"
                          : "var(--text-3)",
                    }}
                  >
                    {data.trend > 0 ? "+" : ""}
                    {data.trend} pts in 30 days
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain list */}
      {data.domains.length > 0 && (
        <>
          <h2
            className="serif tw-h2-mobile"
            style={{ fontSize: 18, fontWeight: 400, marginBottom: 16 }}
          >
            By domain
          </h2>
          <div style={{ marginBottom: 48 }}>
            {data.domains.map((d) => {
              const active = domain === d.name;
              return (
                <button
                  key={d.name}
                  onClick={() => setDomain(d.name)}
                  className="tw-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 70px 60px",
                    columnGap: 16,
                    alignItems: "center",
                    padding: "16px 8px",
                    width: "100%",
                    textAlign: "left",
                    background: active ? "var(--panel)" : "transparent",
                    border: "none",
                    borderTop: "1px solid var(--border-2)",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          background: domainStatusColor(d.score, d.trend),
                        }}
                      />
                      <span
                        className="serif"
                        style={{ fontSize: 15, fontWeight: 400 }}
                      >
                        {d.name}
                      </span>
                    </div>
                    {d.sub && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-3)",
                          marginLeft: 14,
                        }}
                      >
                        {d.sub}
                      </div>
                    )}
                  </div>
                  <div
                    className="serif tw-mono"
                    style={{ fontSize: 22, fontWeight: 400, textAlign: "right" }}
                  >
                    {d.score}
                  </div>
                  {d.trend != null && (
                    <div
                      className="tw-mono"
                      style={{
                        fontSize: 12,
                        color:
                          d.trend < 0
                            ? "var(--red)"
                            : d.trend > 0
                            ? "var(--green)"
                            : "var(--text-3)",
                        textAlign: "right",
                      }}
                    >
                      {d.trend > 0 ? "+" : ""}
                      {d.trend}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Wearable trends */}
      {Object.keys(wearables.metrics ?? {}).length > 0 && (
        <>
          <h2
            className="serif tw-h2-mobile"
            style={{ fontSize: 18, fontWeight: 400, marginBottom: 4 }}
          >
            30-day trends
          </h2>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 22 }}>
            From your connected wearable
          </div>
          <div
            className="tw-stack-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 40,
              marginBottom: 56,
            }}
          >
            {TREND_CARDS.map((c) => {
              const series = wearables.metrics[c.metric] ?? [];
              if (series.length === 0) return null;
              const latest = series[series.length - 1];
              return (
                <PatientTrendCard
                  key={c.metric}
                  label={c.label}
                  value={
                    c.metric === "sleep_duration"
                      ? formatSleep(latest.value)
                      : String(Math.round(latest.value))
                  }
                  unit={c.unit}
                  change={describeTrend(series)}
                  data={series.map((p) => ({ day: p.day, value: p.value }))}
                  color={c.color}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Domain detail */}
      {selected && (
        <>
          <h2
            className="serif tw-h2-mobile"
            style={{ fontSize: 18, fontWeight: 400, marginBottom: 16 }}
          >
            On your {selected.name.toLowerCase()} score
          </h2>
          {selected.prose ? (
            <div style={{ marginBottom: 64 }}>
              {selected.prose.split(/\n\n+/).map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "var(--text)",
                    margin: "0 0 16px",
                    maxWidth: 680,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: "var(--text-2)",
                maxWidth: 680,
                marginBottom: 64,
              }}
            >
              We&apos;re calibrating this domain on your data. Detail coming when
              there&apos;s enough signal.
            </p>
          )}
        </>
      )}

      <Methodology />
    </div>
  );
}

function formatSleep(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return `${whole}h ${minutes.toString().padStart(2, "0")}m`;
}

function describeTrend(series: { day: number; value: number }[]): string {
  if (series.length < 2) return "—";
  const baseline =
    series.slice(0, Math.max(1, Math.floor(series.length / 3))).reduce((s, p) => s + p.value, 0) /
    Math.max(1, Math.floor(series.length / 3));
  const latest = series.slice(-3).reduce((s, p) => s + p.value, 0) / Math.min(3, series.length);
  const delta = latest - baseline;
  if (Math.abs(delta) < 0.5) return "stable vs baseline";
  const pct = Math.round((delta / baseline) * 100);
  return `${pct > 0 ? "+" : ""}${pct}% vs baseline`;
}
