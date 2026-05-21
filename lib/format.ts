/**
 * Editorial date/time formatters used across the patient surfaces. Locale
 * is fixed to en-GB to match the clinic copy ("Wednesday at 08:30").
 */

export function greetingFor(date: Date = new Date()): "morning" | "afternoon" | "evening" {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function editorialDate(d: Date = new Date()): string {
  const day = d.toLocaleDateString("en-GB", { weekday: "long" });
  const part = greetingFor(d);
  const rest = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${day} ${part}, ${rest}`;
}

export function formatVisitDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { weekday: "long" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const target = new Date(iso).getTime();
  const delta = target - now.getTime();
  const minutes = Math.round(delta / 60_000);
  if (Math.abs(minutes) < 60) {
    if (minutes <= 0) return `${Math.abs(minutes)} minutes ago`;
    return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    if (hours <= 0) return `${Math.abs(hours)} hours ago`;
    return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = Math.round(hours / 24);
  if (days <= 0) return `${Math.abs(days)} days ago`;
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

export function formatPastDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Status-dot color for a domain trend. Negative trend → red, mild → amber,
 * positive → green. Matches the JSX's color tokens.
 */
export function domainStatusColor(score: number, trend: number | null): string {
  if (trend !== null && trend <= -10) return "var(--red)";
  if (trend !== null && trend <= -3) return "var(--amber)";
  if (score < 60) return "var(--amber)";
  return "var(--green)";
}
