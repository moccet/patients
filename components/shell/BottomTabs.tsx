"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const TABS = [
  { id: "home", href: "/home", label: "Home" },
  { id: "health", href: "/health", label: "Health" },
  { id: "visits", href: "/visits", label: "Visits" },
  { id: "chat", href: "/chat", label: "Chat" },
] as const;

export function BottomTabs() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      className="tw-mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        justifyContent: "space-around",
        padding: "10px 0 calc(14px + env(safe-area-inset-bottom, 0px))",
        zIndex: 40,
      }}
    >
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.id}
            href={t.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 14px",
              minWidth: 60,
              textDecoration: "none",
            }}
          >
            <Icon name={t.id} active={active} />
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.02em",
                color: active ? "var(--text)" : "var(--text-3)",
                fontWeight: active ? 500 : 400,
              }}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
