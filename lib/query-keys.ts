export const queryKeys = {
  home: () => ["me", "home"] as const,
  visits: (cursor?: string | null) => ["me", "visits", cursor ?? "first"] as const,
  chatMessages: () => ["me", "chat", "messages"] as const,
  chatSuggestions: () => ["me", "chat", "suggestions"] as const,
  intakeTemplate: (encounterId: string) =>
    ["me", "intake", encounterId, "template"] as const,
  profile: () => ["me", "profile"] as const,
  documents: () => ["me", "documents"] as const,
};
