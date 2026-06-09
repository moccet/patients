import { TopBar } from "@/components/shell/TopBar";
import { BottomTabs } from "@/components/shell/BottomTabs";
import AdminViewAsControl from "@/components/admin/AdminViewAsControl";
import { getServerSupabase } from "@/lib/supabase/server";

function initialsFromEmail(email: string | null): string {
  if (!email) return "··";
  const local = email.split("@")[0];
  return local.slice(0, 2).toUpperCase();
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The middleware has already redirected unauthenticated traffic; this
  // is a safe place to read the user for the chrome avatar.
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <AdminViewAsControl />
      <TopBar initials={initialsFromEmail(user?.email ?? null)} />
      {children}
      <BottomTabs />
    </div>
  );
}
