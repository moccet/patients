"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Home } from "@/components/home/Home";
import type { HomePayload } from "@/lib/types";

export default function HomeRoute() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.home(),
    queryFn: () => api<HomePayload>("/home"),
  });

  if (isLoading) {
    return (
      <div
        className="tw-pad-mobile"
        style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px" }}
      >
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div
        className="tw-pad-mobile"
        style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px" }}
      >
        <div style={{ fontSize: 13, color: "var(--red)" }}>
          We couldn&apos;t load your home. Please refresh.
        </div>
      </div>
    );
  }
  return <Home data={data} />;
}
