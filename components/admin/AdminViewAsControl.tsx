"use client";

// Admin "View as patient" control.
//
// Two surfaces, mutually exclusive:
//   1. When NOT impersonating: a floating bottom-right pill that opens a
//      modal listing patients. Visible only when /me/admin/status says
//      the caller is on the portal-admin allowlist.
//   2. When impersonating: a sticky top banner across the whole portal
//      showing "Viewing as <name> — Exit", same priority as a system
//      notice so it can't be missed.
//
// Switching patients reloads the page so every cached query refetches
// against the new patient_id (impersonation header is read fresh on each
// api() call).

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import {
  setImpersonatePatient,
  clearImpersonatePatient,
  getImpersonatePatientId,
} from "@/lib/api-client";

interface AdminStatus {
  isAdmin: boolean;
  isImpersonating: boolean;
  actingEmail: string | null;
  viewingPatientId: string | null;
}

interface PatientRow {
  id: string;
  email: string | null;
  name: string | null;
  lastEncounterAt: string | null;
}

export default function AdminViewAsControl() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [openPicker, setOpenPicker] = useState(false);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<AdminStatus>("/admin/status")
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) setStatus({ isAdmin: false, isImpersonating: false, actingEmail: null, viewingPatientId: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!openPicker || patients.length > 0) return;
    setLoadingPatients(true);
    api<{ patients: PatientRow[] }>("/admin/patients")
      .then((r) => setPatients(r.patients))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, [openPicker, patients.length]);

  if (!status) return null;
  if (!status.isAdmin && !status.isImpersonating) return null;

  const choose = (patientId: string) => {
    setImpersonatePatient(patientId);
    window.location.href = "/home";
  };
  const exit = () => {
    clearImpersonatePatient();
    window.location.href = "/home";
  };

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q)
    );
  });

  const currentlyViewing = status.isImpersonating
    ? patients.find((p) => p.id === status.viewingPatientId) ?? null
    : null;

  return (
    <>
      {status.isImpersonating && (
        <ImpersonationBanner
          viewingId={status.viewingPatientId}
          viewingName={currentlyViewing?.name ?? currentlyViewing?.email ?? null}
          onExit={exit}
        />
      )}

      {status.isAdmin && (
        <button
          type="button"
          onClick={() => setOpenPicker(true)}
          style={floatingBtnStyle}
          aria-label="View as patient"
        >
          {status.isImpersonating ? "Switch patient" : "View as patient"}
        </button>
      )}

      {openPicker && (
        <PickerModal
          patients={filtered}
          allCount={patients.length}
          loading={loadingPatients}
          search={search}
          setSearch={setSearch}
          onClose={() => setOpenPicker(false)}
          onChoose={choose}
        />
      )}
    </>
  );
}

function ImpersonationBanner({
  viewingId,
  viewingName,
  onExit,
}: {
  viewingId: string | null;
  viewingName: string | null;
  onExit: () => void;
}) {
  // Banner needs to push the page content down — we set a runtime CSS var
  // that PortalLayout reads via padding-top. Simpler: position:sticky.
  return (
    <div style={bannerStyle}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600 }}>Admin view</span>
        <span style={{ opacity: 0.7, margin: "0 8px" }}>·</span>
        Viewing as{" "}
        <span style={{ fontWeight: 500 }}>
          {viewingName ?? (viewingId ? viewingId.slice(0, 8) + "…" : "patient")}
        </span>
        <span style={{ opacity: 0.7, marginLeft: 12, fontSize: 12 }}>
          read-only — writes blocked
        </span>
      </div>
      <button type="button" onClick={onExit} style={bannerExitBtn}>
        Exit
      </button>
    </div>
  );
}

function PickerModal({
  patients,
  allCount,
  loading,
  search,
  setSearch,
  onClose,
  onChoose,
}: {
  patients: PatientRow[];
  allCount: number;
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  onClose: () => void;
  onChoose: (id: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={modalBackdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modalCardStyle} role="dialog" aria-label="View as patient">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid var(--border-2)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>View as patient</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              padding: 4,
              fontSize: 16,
              color: "var(--text-3)",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 14 }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: "1px solid var(--border-2)",
              borderRadius: 6,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            borderTop: "1px solid var(--border-2)",
          }}
        >
          {loading && (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 13,
              }}
            >
              Loading…
            </div>
          )}
          {!loading && patients.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 13,
              }}
            >
              {allCount === 0
                ? "No patients found."
                : "No matches for that search."}
            </div>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {patients.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onChoose(p.id)}
                  style={patientRowBtn}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-1)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name ?? p.email ?? p.id.slice(0, 8)}
                    </div>
                    {p.email && p.name && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-3)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.email}
                      </div>
                    )}
                  </div>
                  {p.lastEncounterAt && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-3)",
                        marginLeft: 12,
                        flexShrink: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {new Date(p.lastEncounterAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const floatingBtnStyle: React.CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 88,
  zIndex: 50,
  padding: "10px 16px",
  fontSize: 12,
  letterSpacing: 0.3,
  background: "var(--text-1, #1a1a1a)",
  color: "var(--bg-1, #fff)",
  border: 0,
  borderRadius: 999,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
  fontFamily: "inherit",
};

const bannerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 16px",
  background: "#FEF3C7",
  borderBottom: "1px solid #FDE68A",
  color: "#78350F",
  fontSize: 13,
  lineHeight: 1.3,
};

const bannerExitBtn: React.CSSProperties = {
  padding: "6px 14px",
  fontSize: 12,
  background: "#78350F",
  color: "#FEF3C7",
  border: 0,
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};

const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(20,20,20,0.45)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "10vh",
  zIndex: 70,
};

const modalCardStyle: React.CSSProperties = {
  background: "var(--bg-1, #fff)",
  border: "1px solid var(--border-2)",
  borderRadius: 12,
  width: "min(520px, 92vw)",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const patientRowBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "12px 16px",
  background: "transparent",
  border: 0,
  borderBottom: "1px solid var(--border-2)",
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "inherit",
  gap: 8,
};
