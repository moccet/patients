export const queryKeys = {
  home: () => ["me", "home"] as const,
  wellness: () => ["me", "wellness"] as const,
  methodology: () => ["me", "wellness", "methodology"] as const,
  wearables: (metrics?: string[]) =>
    ["me", "wearables", metrics?.join(",") ?? "default"] as const,
  visits: (cursor?: string | null) => ["me", "visits", cursor ?? "first"] as const,
  chatMessages: () => ["me", "chat", "messages"] as const,
  chatSuggestions: () => ["me", "chat", "suggestions"] as const,
  intakeTemplate: (encounterId: string) =>
    ["me", "intake", encounterId, "template"] as const,
  profile: () => ["me", "profile"] as const,
};
