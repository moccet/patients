"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { NEXT_PUBLIC_API_BASE } from "@/lib/env";
import type { DocumentsPayload, DocumentType, PatientDocument } from "@/lib/types";

const ACCEPTED = "application/pdf,image/jpeg,image/png,image/heic,image/webp";
const MAX = 25 * 1024 * 1024;

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "lab", label: "Lab result / blood test" },
  { value: "medical", label: "Medical document" },
  { value: "letter", label: "Letter / referral" },
  { value: "other", label: "Other" },
];

export function Labs() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.documents(),
    queryFn: () => api<DocumentsPayload>("/documents"),
  });

  const [pending, setPending] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>("lab");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("documentType", docType);
      if (notes.trim()) form.append("notes", notes.trim());
      return api<{ document: PatientDocument }>("/documents", {
        method: "POST",
        body: form,
      });
    },
    onSuccess: () => {
      setPending(null);
      setNotes("");
      setDocType("lab");
      if (fileInputRef.current) fileInputRef.current.value = "";
      qc.invalidateQueries({ queryKey: queryKeys.documents() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.documents() }),
  });

  const onPick = (f: File | null) => {
    if (!f) return setPending(null);
    if (f.size > MAX) {
      alert(`File too large. Maximum is 25 MB. (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    setPending(f);
  };

  return (
    <div
      className="tw-pad-mobile tw-padding-bottom-tabs"
      style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 80px" }}
    >
      <header style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          Your documents
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", margin: 0 }}
        >
          Lab results &amp; medical papers.
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
          Upload blood tests, scan reports, letters from other clinicians, or
          anything else you&apos;d like in one place. PDF, JPEG, PNG, HEIC or
          WebP — up to 25 MB.
        </p>
      </header>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: "32px 24px",
          border: `1.5px dashed ${dragOver ? "var(--text)" : "var(--border)"}`,
          borderRadius: 6,
          background: dragOver ? "var(--panel)" : "transparent",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.15s",
          marginBottom: 16,
        }}
      >
        <div className="serif" style={{ fontSize: 17, fontWeight: 400, marginBottom: 6 }}>
          {pending ? pending.name : "Drag a file here or click to pick one"}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
          {pending
            ? `${(pending.size / 1024 / 1024).toFixed(2)} MB · ${pending.type}`
            : "PDF · JPEG · PNG · HEIC · WebP"}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: "none" }}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </div>

      {pending && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              style={{
                padding: "10px 12px",
                fontSize: 14,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 3,
              }}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                flex: "1 1 220px",
                padding: "10px 12px",
                fontSize: 14,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 3,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => uploadMutation.mutate(pending)}
              disabled={uploadMutation.isPending}
              style={{
                padding: "10px 22px",
                background: uploadMutation.isPending ? "var(--panel-2)" : "var(--text)",
                color: uploadMutation.isPending ? "var(--text-3)" : "white",
                border: "none",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                cursor: uploadMutation.isPending ? "default" : "pointer",
              }}
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </button>
            <button
              onClick={() => {
                setPending(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              style={{
                padding: "10px 22px",
                background: "transparent",
                color: "var(--text-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
          {uploadMutation.error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "var(--red-soft)",
                color: "var(--red)",
                fontSize: 13,
                borderRadius: 3,
              }}
            >
              Upload failed. Please try again or use a smaller file.
            </div>
          )}
        </div>
      )}

      {/* Existing documents */}
      <h2
        className="serif tw-h2-mobile"
        style={{ fontSize: 19, fontWeight: 400, marginBottom: 14 }}
      >
        On file
      </h2>

      {isLoading && <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</div>}
      {error && (
        <div style={{ fontSize: 13, color: "var(--red)" }}>
          We couldn&apos;t load your documents. Please refresh.
        </div>
      )}
      {data && data.documents.length === 0 && !isLoading && (
        <div style={{ padding: "16px 0", fontSize: 13, color: "var(--text-3)", lineHeight: 1.65 }}>
          No documents yet. Upload your first one above.
        </div>
      )}
      {data?.documents.map((d) => (
        <DocumentRow
          key={d.id}
          doc={d}
          onDelete={() => {
            if (confirm(`Delete "${d.fileName}"?`)) deleteMutation.mutate(d.id);
          }}
          deleting={deleteMutation.isPending}
        />
      ))}
    </div>
  );
}

function DocumentRow({
  doc,
  onDelete,
  deleting,
}: {
  doc: PatientDocument;
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
        alignItems: "baseline",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="serif" style={{ fontSize: 15, wordBreak: "break-word" }}>
          {doc.fileName}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
          {labelFor(doc.documentType)} ·{" "}
          {new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
          {doc.notes ? ` · ${doc.notes}` : ""}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <a
          href={`${NEXT_PUBLIC_API_BASE}/api/v1/me/documents/${doc.id}/download`}
          style={{
            fontSize: 12,
            color: "var(--text-2)",
            textDecoration: "underline",
          }}
        >
          Download
        </a>
        <button
          onClick={onDelete}
          disabled={deleting}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: deleting ? "var(--text-3)" : "var(--text-2)",
            cursor: deleting ? "default" : "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function labelFor(t: DocumentType): string {
  switch (t) {
    case "lab":
      return "Lab result";
    case "medical":
      return "Medical document";
    case "letter":
      return "Letter";
    default:
      return "Other";
  }
}
