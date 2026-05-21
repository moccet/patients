type IconName = "home" | "visits" | "chat";

export function Icon({ name, active }: { name: IconName; active: boolean }) {
  const stroke = active ? "var(--text)" : "var(--text-3)";
  const sw = 1.5;
  switch (name) {
    case "home":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 11L12 4L21 11V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V11Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "visits":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="1" stroke={stroke} strokeWidth={sw} />
          <path d="M3 10H21M8 3V7M16 3V7" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "chat":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12C21 16.4 16.97 20 12 20C10.55 20 9.18 19.7 8 19.16L3 20L4.13 16.27C3.41 15.04 3 13.56 3 12C3 7.6 7.03 4 12 4C16.97 4 21 7.6 21 12Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
