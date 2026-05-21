import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { Chat } from "@/components/chat/Chat";

export default async function ChatRoute() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/chat");
  return <Chat patientId={user.id} />;
}
