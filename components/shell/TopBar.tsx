"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../primitives/Logo";

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/visits", label: "Visits" },
  { href: "/labs", label: "Labs" },
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
] as const;

export type TabId = "home" | "visits" | "labs" | "chat" | "profile";

export function TopBar({ initials = "JW" }: { initials?: string }) {
  const pathname = usePathname() ?? "";
  return (
    <div
      className="tw-pad-mobile"
      style={{
        height: 60,
        borderBottom: "1px solid var(--border-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        <Logo />
        <nav className="tw-desktop-only" style={{ gap: 4 }}>
          {TABS.map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--text)" : "var(--text-3)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link
          href="/settings"
          aria-label="Settings"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "var(--gold)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {initials}
        </Link>
      </div>
    </div>
  );
}
