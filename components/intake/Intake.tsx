"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { IntakeTemplatePayload } from "@/lib/types";

type Answers = Record<string, string | number | string[] | undefined>;

export function Intake({
  encounterId,
  template,
}: {
  encounterId: string;
  template: IntakeTemplatePayload;
}) {
  const router = useRouter();
  const questions = template.questions;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(
    (template.existingAnswers as Answers) ?? {},
  );

  const total = questions.length;
  const q = questions[step];
  const isLast = step === total - 1;

  const setAnswer = (id: string, v: string | number | string[]) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const submitMutation = useMutation({
    mutationFn: (vars: { answers: Answers; partial: boolean }) =>
      api(`/intake/${encounterId}/submit`, {
        method: "POST",
        body: JSON.stringify(vars),
      }),
  });

  const canProceed = () => {
    const a = answers[q.id];
    if (q.type === "multi") return true;
    if (q.type === "scale") return a !== undefined;
    return typeof a === "string" && a.length > 2;
  };

  const next = async () => {
    // Save-and-continue: persist partial draft on every step (spec §8.3)
    if (!isLast) {
      submitMutation.mutate({ answers, partial: true });
      setStep(step + 1);
      return;
    }
    await submitMutation.mutateAsync({ answers, partial: false });
    router.replace(`/intake/${encounterId}/complete`);
  };

  const saveAndLeave = () => {
    submitMutation.mutate({ answers, partial: true });
    router.push("/home");
  };

  if (!q) {
    return (
      <div style={{ padding: 32 }}>
        <p>This form has no questions configured.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        paddingBottom: "env(keyboard-inset-height, 0px)",
      }}
    >
      <div style={{ position: "sticky", top: 0, background: "var(--bg)", zIndex: 10 }}>
        <div style={{ height: 2, background: "var(--border)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${((step + 1) / total) * 100}%`,
              background: "var(--text)",
              transition: "width 0.4s cubic-bezier(0.2,0,0,1)",
            }}
          />
        </div>
        <div
          className="tw-pad-mobile"
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 32px",
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
          }}
        >
          <button
            onClick={saveAndLeave}
            style={{
              background: "none",
              border: "none",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            ← Save and leave
          </button>
          <div>
            Question {step + 1} of {total}
          </div>
        </div>
      </div>

      <div
        className="tw-pad-mobile"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
        }}
      >
        <div key={step} className="tw-slide" style={{ width: "100%", maxWidth: 680 }}>
          <div
            className="serif tw-h1-mobile"
            style={{
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.25,
              letterSpacing: "-0.015em",
              marginBottom: 14,
            }}
          >
            {q.label}
          </div>
          {q.hint && (
            <div
              style={{
                fontSize: 14,
                color: "var(--text-3)",
                marginBottom: 32,
                maxWidth: 540,
              }}
            >
              {q.hint}
            </div>
          )}

          {q.type === "longtext" && (
            <textarea
              autoFocus
              value={(answers[q.id] as string) || ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder={q.placeholder ?? undefined}
              style={{
                width: "100%",
                minHeight: 140,
                fontSize: 17,
                lineHeight: 1.5,
                fontFamily: "inherit",
                color: "var(--text)",
                background: "transparent",
                border: "none",
                borderBottom: "2px solid var(--border)",
                padding: "12px 0",
                resize: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderBottomColor = "var(--text)";
              }}
              onBlur={(e) => {
                e.target.style.borderBottomColor = "var(--border)";
              }}
            />
          )}

          {q.type === "scale" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(10, 1fr)",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                  const selected = answers[q.id] === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setAnswer(q.id, n)}
                      style={{
                        padding: "18px 0",
                        background: selected ? "var(--text)" : "transparent",
                        color: selected ? "white" : "var(--text)",
                        border: "1px solid",
                        borderColor: selected ? "var(--text)" : "var(--border)",
                        fontSize: 15,
                        fontWeight: 400,
                        borderRadius: 3,
                        transition: "all 0.15s",
                        cursor: "pointer",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "var(--text-3)",
                }}
              >
                <span>Much worse than usual</span>
                <span>Much better than usual</span>
              </div>
            </div>
          )}

          {q.type === "multi" && q.options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt) => {
                const current = (answers[q.id] as string[] | undefined) || [];
                const selected = current.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() =>
                      setAnswer(
                        q.id,
                        selected ? current.filter((x) => x !== opt) : [...current, opt],
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      textAlign: "left",
                      background: selected ? "var(--green-soft)" : "transparent",
                      border: "1px solid",
                      borderColor: selected ? "var(--green)" : "var(--border)",
                      fontSize: 15,
                      color: "var(--text)",
                      borderRadius: 3,
                      transition: "all 0.15s",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        border: "1.5px solid",
                        borderColor: selected ? "var(--green)" : "var(--border)",
                        background: selected ? "var(--green)" : "transparent",
                        color: "white",
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {selected && "✓"}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              marginTop: 36,
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={next}
              disabled={!canProceed() || submitMutation.isPending}
              style={{
                padding: "12px 28px",
                background: canProceed() && !submitMutation.isPending ? "var(--text)" : "var(--panel-2)",
                color: canProceed() && !submitMutation.isPending ? "white" : "var(--text-3)",
                border: "none",
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 4,
                cursor: canProceed() && !submitMutation.isPending ? "pointer" : "not-allowed",
              }}
            >
              {submitMutation.isPending ? "Saving…" : isLast ? "Submit →" : "Continue →"}
            </button>
            <span
              className="tw-hide-mobile"
              style={{ fontSize: 11, color: "var(--text-3)" }}
            >
              Or press{" "}
              <span
                style={{
                  padding: "1px 5px",
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                }}
              >
                ↵
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
