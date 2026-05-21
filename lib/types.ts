// Wire types shared between API client and components.
// These mirror `/api/v1/me/*` JSON responses.

export type HomePayload = {
  firstName: string | null;
  nextVisit: {
    id: string;
    scheduledAt: string;
    encounterType: string;
    location: string | null;
    clinician: string | null;
    intakeRequired: boolean;
    intakeCompleted: boolean;
  } | null;
  wellness: {
    score: number;
    trend: number | null;
    summaryProse: string | null;
    domains: { name: string; score: number; trend: number | null; sub: string | null }[];
  } | null;
  insights: {
    id: string;
    when: string;
    title: string;
    domain: string | null;
    severity: "attention" | "watch" | "good";
    body: string;
  }[];
};

export type WellnessPayload = {
  score: number | null;
  trend?: number | null;
  summaryProse?: string | null;
  methodologyVersion?: string;
  snapshotDate?: string;
  domains: {
    name: string;
    score: number;
    trend: number | null;
    sub: string | null;
    prose: string | null;
  }[];
  series: {
    composite: { date: string; value: number }[];
    byDomain: Record<string, { date: string; value: number }[]>;
  };
};

export type WearablesPayload = {
  metrics: Record<string, { day: number; value: number; unit: string | null }[]>;
};

export type MethodologyPayload = {
  version: string;
  weights: Record<string, number>;
  citations: { domain: string; ref: string }[];
  prose: Record<string, string>;
  pdfAvailable: boolean;
};

export type VisitsPayload = {
  upcoming: HomePayload["nextVisit"][] extends Array<infer T> ? T[] : never;
  past: {
    id: string;
    scheduledAt: string;
    encounterType: string;
    location: string | null;
    clinician: string | null;
    sealed: boolean;
    summary: string | null;
  }[];
  nextCursor: string | null;
};

export type ChatMessagesPayload = {
  messages: { id: string; from: "agent" | "patient"; time: string; text: string }[];
  nextCursor: string | null;
};

export type ChatSuggestionsPayload = { suggestions: string[] };

export type IntakeTemplatePayload = {
  template: { version: string; title: string; encounterType: string };
  questions: {
    id: string;
    type: "longtext" | "scale" | "multi";
    label: string;
    hint: string | null;
    placeholder: string | null;
    options: string[] | null;
    required: boolean;
  }[];
  existingAnswers: Record<string, unknown> | null;
  partial: boolean;
  completedAt: string | null;
};

export type ProfilePayload = {
  patientId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  memberSince: string | null;
  tier: string | null;
};
