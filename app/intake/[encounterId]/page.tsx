"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Intake } from "@/components/intake/Intake";
import type { IntakeTemplatePayload } from "@/lib/types";

export default function IntakeRoute({
  params,
}: {
  params: Promise<{ encounterId: string }>;
}) {
  const { encounterId } = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.intakeTemplate(encounterId),
    queryFn: () => api<IntakeTemplatePayload>(`/intake/${encounterId}/template`),
  });

  if (isLoading) {
    return (
      <div
        className="tw-pad-mobile"
        style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px" }}
      >
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div
        className="tw-pad-mobile"
        style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px" }}
      >
        <div style={{ fontSize: 13, color: "var(--red)" }}>
          This form is not available. Return to your home to confirm your next
          visit.
        </div>
      </div>
    );
  }
  return <Intake encounterId={encounterId} template={data} />;
}
