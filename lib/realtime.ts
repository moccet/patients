"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ChatMessagesPayload } from "@/lib/types";

type AgentMessage = ChatMessagesPayload["messages"][number];

/**
 * Subscribe to new agent replies for the current patient. Returns a
 * cleanup function that unsubscribes the channel.
 *
 * We use Postgres Changes on `patient_chat_messages` filtered by patient_id
 * + sender=agent. The patient's own messages don't come through this stream
 * (the client already optimistically appended them on POST).
 */
export function subscribeToAgentMessages(
  patientId: string,
  onMessage: (msg: AgentMessage) => void,
): () => void {
  const supabase = getBrowserSupabase();
  const channel: RealtimeChannel = supabase
    .channel(`chat:${patientId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "patient_chat_messages",
        filter: `patient_id=eq.${patientId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        const row = payload.new as unknown as {
          id: string;
          sender: "agent" | "patient";
          body: string;
          created_at: string;
        };
        if (row.sender !== "agent") return;
        onMessage({ id: row.id, from: row.sender, time: row.created_at, text: row.body });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
