"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  ProfilePayload,
  Medication,
  Condition,
  Allergy,
  AllergySeverity,
} from "@/lib/types";

const SEVERITIES: AllergySeverity[] = ["mild", "moderate", "severe", "life_threatening"];

export function Profile() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => api<ProfilePayload>("/profile"),
  });

  if (isLoading) return <Skeleton text="Loading your profile…" />;
  if (error || !data) return <Skeleton text="We couldn't load your profile. Please refresh." error />;

  return (
    <div
      className="tw-pad-mobile tw-padding-bottom-tabs"
      style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 80px" }}
    >
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          Your profile
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", margin: 0 }}
        >
          {data.firstName ? `${data.firstName}${data.lastName ? " " + data.lastName : ""}` : "Welcome"}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            marginTop: 8,
            lineHeight: 1.65,
          }}
        >
          {data.email}
        </p>
      </header>

      <MedicationsSection items={data.medications} />
      <ConditionsSection items={data.conditions} />
      <AllergiesSection items={data.allergies} />
    </div>
  );
}

function Skeleton({ text, error }: { text: string; error?: boolean }) {
  return (
    <div
      className="tw-pad-mobile"
      style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px" }}
    >
      <div style={{ fontSize: 13, color: error ? "var(--red)" : "var(--text-3)" }}>{text}</div>
    </div>
  );
}

// ---------------- Medications ----------------

function MedicationsSection({ items }: { items: Medication[] }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const addMutation = useMutation({
    mutationFn: (vars: { name: string; dose?: string; frequency?: string; notes?: string }) =>
      api<{ medication: Medication }>("/profile/medications", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile() });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/profile/medications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile() }),
  });

  return (
    <Section title="Medications" onAdd={() => setShowForm(true)}>
      {items.length === 0 && !showForm && (
        <Empty text="Add the medications you take regularly so your clinician has them on hand." />
      )}
      {items.map((m) => (
        <Row key={m.id} onDelete={() => deleteMutation.mutate(m.id)} deleting={deleteMutation.isPending}>
          <div className="serif" style={{ fontSize: 15 }}>{m.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {[m.dose, m.frequency].filter(Boolean).join(" · ")}
            {m.notes ? ` — ${m.notes}` : ""}
          </div>
        </Row>
      ))}
      {showForm && (
        <InlineForm
          fields={[
            { name: "name", label: "Name", required: true, placeholder: "e.g. Ramipril" },
            { name: "dose", label: "Dose", placeholder: "e.g. 5mg" },
            { name: "frequency", label: "Frequency", placeholder: "e.g. once daily" },
            { name: "notes", label: "Notes", placeholder: "anything else" },
          ]}
          onCancel={() => setShowForm(false)}
          onSubmit={(values) => addMutation.mutate(values as never)}
          submitting={addMutation.isPending}
        />
      )}
    </Section>
  );
}

// ---------------- Conditions ----------------

function ConditionsSection({ items }: { items: Condition[] }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const addMutation = useMutation({
    mutationFn: (vars: { name: string; diagnosedAt?: string; notes?: string }) =>
      api<{ condition: Condition }>("/profile/conditions", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile() });
      setShowForm(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/profile/conditions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile() }),
  });

  return (
    <Section title="Conditions" onAdd={() => setShowForm(true)}>
      {items.length === 0 && !showForm && (
        <Empty text="Add any diagnosed conditions so your clinician sees the whole picture." />
      )}
      {items.map((c) => (
        <Row key={c.id} onDelete={() => deleteMutation.mutate(c.id)} deleting={deleteMutation.isPending}>
          <div className="serif" style={{ fontSize: 15 }}>{c.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {c.diagnosedAt ? `Diagnosed ${c.diagnosedAt}` : ""}
            {c.notes ? `${c.diagnosedAt ? " — " : ""}${c.notes}` : ""}
          </div>
        </Row>
      ))}
      {showForm && (
        <InlineForm
          fields={[
            { name: "name", label: "Name", required: true, placeholder: "e.g. Hypertension" },
            { name: "diagnosedAt", label: "Diagnosed (YYYY-MM-DD)", placeholder: "2018-04-12" },
            { name: "notes", label: "Notes", placeholder: "anything else" },
          ]}
          onCancel={() => setShowForm(false)}
          onSubmit={(values) => addMutation.mutate(values as never)}
          submitting={addMutation.isPending}
        />
      )}
    </Section>
  );
}

// ---------------- Allergies ----------------

function AllergiesSection({ items }: { items: Allergy[] }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const addMutation = useMutation({
    mutationFn: (vars: { name: string; severity?: string; reaction?: string; notes?: string }) =>
      api<{ allergy: Allergy }>("/profile/allergies", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile() });
      setShowForm(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/profile/allergies/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile() }),
  });

  return (
    <Section title="Allergies" onAdd={() => setShowForm(true)}>
      {items.length === 0 && !showForm && (
        <Empty text="Add allergies (medications, food, environmental) so clinicians know what to avoid." />
      )}
      {items.map((a) => (
        <Row key={a.id} onDelete={() => deleteMutation.mutate(a.id)} deleting={deleteMutation.isPending}>
          <div className="serif" style={{ fontSize: 15 }}>
            {a.name}
            {a.severity && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 3,
                  letterSpacing: "0.04em",
                  background:
                    a.severity === "life_threatening" || a.severity === "severe"
                      ? "var(--red-soft)"
                      : a.severity === "moderate"
                      ? "var(--amber-soft)"
                      : "var(--green-soft)",
                  color:
                    a.severity === "life_threatening" || a.severity === "severe"
                      ? "var(--red)"
                      : a.severity === "moderate"
                      ? "var(--amber)"
                      : "var(--green)",
                  verticalAlign: "middle",
                }}
              >
                {a.severity.replace("_", "-")}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {[a.reaction, a.notes].filter(Boolean).join(" — ")}
          </div>
        </Row>
      ))}
      {showForm && (
        <InlineForm
          fields={[
            { name: "name", label: "Name", required: true, placeholder: "e.g. Penicillin" },
            {
              name: "severity",
              label: "Severity",
              type: "select",
              options: SEVERITIES,
            },
            { name: "reaction", label: "Reaction", placeholder: "e.g. rash, swelling" },
            { name: "notes", label: "Notes", placeholder: "anything else" },
          ]}
          onCancel={() => setShowForm(false)}
          onSubmit={(values) => addMutation.mutate(values as never)}
          submitting={addMutation.isPending}
        />
      )}
    </Section>
  );
}

// ---------------- shared layout primitives ----------------

function Section({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <h2 className="serif tw-h2-mobile" style={{ fontSize: 19, fontWeight: 400, margin: 0 }}>
          {title}
        </h2>
        <button
          onClick={onAdd}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "var(--text-2)",
            cursor: "pointer",
          }}
        >
          + Add
        </button>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Row({
  children,
  onDelete,
  deleting,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 0",
        borderTop: "1px solid var(--border-2)",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      <button
        onClick={onDelete}
        disabled={deleting}
        style={{
          background: "none",
          border: "none",
          fontSize: 11,
          color: deleting ? "var(--text-3)" : "var(--text-2)",
          cursor: deleting ? "default" : "pointer",
          letterSpacing: "0.02em",
        }}
      >
        Remove
      </button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ padding: "16px 0", fontSize: 13, color: "var(--text-3)", lineHeight: 1.65 }}>
      {text}
    </div>
  );
}

type FormField = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "select";
  options?: readonly string[];
};

function InlineForm({
  fields,
  onSubmit,
  onCancel,
  submitting,
}: {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const canSubmit = fields
    .filter((f) => f.required)
    .every((f) => (values[f.name] ?? "").trim().length > 0);

  return (
    <div
      style={{
        padding: "20px",
        marginTop: 8,
        border: "1px solid var(--border)",
        borderRadius: 4,
        background: "var(--panel)",
      }}
    >
      {fields.map((f) => (
        <div key={f.name} style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            {f.label}
            {f.required && <span style={{ color: "var(--red)" }}> *</span>}
          </label>
          {f.type === "select" ? (
            <select
              value={values[f.name] ?? ""}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 14,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text)",
              }}
            >
              <option value="">—</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o.replace("_", "-")}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={values[f.name] ?? ""}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 14,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text)",
              }}
            />
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={() => {
            const clean: Record<string, string> = {};
            for (const [k, v] of Object.entries(values)) {
              const trimmed = v.trim();
              if (trimmed) clean[k] = trimmed;
            }
            onSubmit(clean);
          }}
          disabled={!canSubmit || submitting}
          style={{
            padding: "8px 18px",
            background: canSubmit && !submitting ? "var(--text)" : "var(--panel-2)",
            color: canSubmit && !submitting ? "white" : "var(--text-3)",
            border: "none",
            borderRadius: 3,
            fontSize: 13,
            cursor: canSubmit && !submitting ? "pointer" : "default",
          }}
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "8px 18px",
            background: "transparent",
            color: "var(--text-2)",
            border: "1px solid var(--border)",
            borderRadius: 3,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
