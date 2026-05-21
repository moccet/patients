"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { NEXT_PUBLIC_API_BASE } from "@/lib/env";
import type { MethodologyPayload } from "@/lib/types";

const LS_KEY = "tw:methodology:collapsed";

export function Methodology() {
  // Default to expanded the first time the patient sees Health (spec §4.4).
  // Persist their choice so it stays collapsed on return visits.
  const [open, setOpen] = useState(true);
  useEffect(() => {
    try {
      const persisted = window.localStorage.getItem(LS_KEY);
      if (persisted === "1") setOpen(false);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(LS_KEY, next ? "0" : "1");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.methodology(),
    queryFn: () => api<MethodologyPayload>("/wellness/methodology"),
    enabled: open,
  });

  return (
    <div style={{ paddingTop: 32, borderTop: "1px solid var(--border)" }}>
      <button
        onClick={toggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          textAlign: "left",
          cursor: "pointer",
          marginBottom: 24,
        }}
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
            The science
          </div>
          <h2
            className="serif tw-h2-mobile"
            style={{
              fontSize: 22,
              fontWeight: 400,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            How your wellness score is calculated
          </h2>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="tw-fade">
          {isLoading || !data ? (
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</p>
          ) : (
            <MethodologyBody data={data} />
          )}
        </div>
      )}
    </div>
  );
}

function MethodologyBody({ data }: { data: MethodologyPayload }) {
  const domainNames = Object.keys(data.weights);
  return (
    <>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: "var(--text)",
          margin: "0 0 16px",
          maxWidth: 680,
        }}
      >
        A weighted composite across six domains. Weights follow the prognostic
        strength of each domain in peer-reviewed literature.
      </p>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: "var(--text)",
          margin: "0 0 32px",
          maxWidth: 680,
        }}
      >
        Every input is scored against The Wellness functional ranges, tighter
        than standard laboratory reference intervals. Where population data
        exists, your value is also z-scored against the age- and sex-matched
        cohort.
      </p>

      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 14,
          }}
        >
          Weighting
        </div>
        {domainNames.map((name) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 60px 1fr",
              columnGap: 20,
              padding: "12px 0",
              borderTop: "1px solid var(--border-2)",
              alignItems: "baseline",
            }}
          >
            <div className="serif" style={{ fontSize: 14, fontWeight: 400 }}>
              {name}
            </div>
            <div className="tw-mono" style={{ fontSize: 14, color: "var(--text)" }}>
              {data.weights[name]}%
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              {data.prose[name] ?? ""}
            </div>
          </div>
        ))}
      </div>

      {data.citations.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
              marginBottom: 14,
            }}
          >
            Selected references
          </div>
          {data.citations.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "10px 0",
                borderTop: "1px solid var(--border-2)",
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                columnGap: 16,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{c.domain}</div>
              <div style={{ color: "var(--text-2)" }}>{c.ref}</div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          padding: "20px 24px",
          background: "var(--panel)",
          fontSize: 12,
          color: "var(--text-2)",
          lineHeight: 1.7,
          marginBottom: 24,
        }}
      >
        <strong style={{ color: "var(--text)" }}>What the score is not.</strong>{" "}
        It isn&apos;t a diagnosis. It doesn&apos;t replace clinical judgement. It
        surfaces patterns and changes that a busy clinician might miss across
        siloed data. Your doctor remains the final arbiter of any decision
        about your care.
      </div>

      {data.pdfAvailable && (
        <a
          href={`${NEXT_PUBLIC_API_BASE}/api/v1/me/wellness/methodology.pdf`}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 12,
            color: "var(--text-2)",
            textDecoration: "underline",
          }}
        >
          Download methodology paper (PDF)
        </a>
      )}
      <div
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          lineHeight: 1.6,
          marginTop: 14,
        }}
      >
        Version {data.version} · reviewed quarterly by The Wellness clinical
        advisory board.
      </div>
    </>
  );
}
