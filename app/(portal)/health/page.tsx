"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Health } from "@/components/health/Health";
import type { WellnessPayload, WearablesPayload } from "@/lib/types";

export default function HealthRoute() {
  const wellnessQ = useQuery({
    queryKey: queryKeys.wellness(),
    queryFn: () => api<WellnessPayload>("/wellness"),
  });
  const wearablesQ = useQuery({
    queryKey: queryKeys.wearables(),
    queryFn: () => api<WearablesPayload>("/wearables"),
  });

  if (wellnessQ.isLoading || wearablesQ.isLoading) {
    return (
      <div
        className="tw-pad-mobile"
        style={{ maxWidth: 880, margin: "0 auto", padding: "48px 32px" }}
      >
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</div>
      </div>
    );
  }
  if (!wellnessQ.data || !wearablesQ.data) {
    return (
      <div
        className="tw-pad-mobile"
        style={{ maxWidth: 880, margin: "0 auto", padding: "48px 32px" }}
      >
        <div style={{ fontSize: 13, color: "var(--red)" }}>
          We couldn&apos;t load your health data. Please refresh.
        </div>
      </div>
    );
  }
  return <Health data={wellnessQ.data} wearables={wearablesQ.data} />;
}
