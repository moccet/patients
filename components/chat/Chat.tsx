"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { subscribeToAgentMessages } from "@/lib/realtime";
import type { ChatMessagesPayload, ChatSuggestionsPayload } from "@/lib/types";

export function Chat({ patientId }: { patientId: string }) {
  const qc = useQueryClient();
  const messagesQuery = useQuery({
    queryKey: queryKeys.chatMessages(),
    queryFn: () => api<ChatMessagesPayload>("/chat/messages"),
  });
  const suggestionsQuery = useQuery({
    queryKey: queryKeys.chatSuggestions(),
    queryFn: () => api<ChatSuggestionsPayload>("/chat/suggestions"),
  });

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTyping = () => {
    setTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Realtime: when an agent message lands, push it into the cache.
  useEffect(() => {
    return subscribeToAgentMessages(patientId, (msg) => {
      qc.setQueryData<ChatMessagesPayload>(queryKeys.chatMessages(), (prev) => {
        if (!prev) return { messages: [msg], nextCursor: null };
        if (prev.messages.some((m) => m.id === msg.id)) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
      clearTyping();
    });
  }, [patientId, qc]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesQuery.data, typing]);

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      api<{ id: string; createdAt: string }>("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: queryKeys.chatMessages() });
      const previous = qc.getQueryData<ChatMessagesPayload>(queryKeys.chatMessages());
      const optimistic = {
        id: `opt-${Date.now()}`,
        from: "patient" as const,
        time: new Date().toISOString(),
        text,
      };
      qc.setQueryData<ChatMessagesPayload>(queryKeys.chatMessages(), (prev) => ({
        messages: [...(prev?.messages ?? []), optimistic],
        nextCursor: prev?.nextCursor ?? null,
      }));
      setInput("");
      setTyping(true);
      // Failsafe: if Realtime never delivers (network blip, agent crash),
      // stop the typing animation after 15s rather than spinning forever.
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 15_000);
      return { previous, optimisticId: optimistic.id };
    },
    onError: (_err, _text, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.chatMessages(), ctx.previous);
      clearTyping();
    },
    onSuccess: (res, _text, ctx) => {
      // Replace the optimistic id with the real id.
      qc.setQueryData<ChatMessagesPayload>(queryKeys.chatMessages(), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === ctx?.optimisticId ? { ...m, id: res.id, time: res.createdAt } : m,
          ),
        };
      });
    },
  });

  const send = () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  const messages = messagesQuery.data?.messages ?? [];
  const suggestions = suggestionsQuery.data?.suggestions ?? [];

  return (
    <div
      className="tw-pad-mobile"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 60px)",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div style={{ padding: "32px 28px 20px" }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Your health agent
        </div>
        <h1
          className="serif tw-h1-mobile"
          style={{
            fontSize: 26,
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          Always available, never urgent.
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-2)",
            marginTop: 10,
            lineHeight: 1.65,
          }}
        >
          Speak freely. I only share with your clinician what you ask me to.
        </p>
      </div>

      <div
        ref={messagesRef}
        className="tw-scroll"
        style={{ flex: 1, overflowY: "auto", padding: "0 28px 12px" }}
      >
        {messages.map((m) => {
          const time = new Date(m.time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={m.id}
              className="tw-fade"
              style={{
                display: "flex",
                justifyContent: m.from === "patient" ? "flex-end" : "flex-start",
                marginBottom: 14,
              }}
            >
              <div style={{ maxWidth: "82%" }}>
                {m.from === "agent" && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                      paddingLeft: 4,
                    }}
                  >
                    Your agent · {time}
                  </div>
                )}
                <div
                  style={{
                    padding: "12px 16px",
                    background:
                      m.from === "patient" ? "var(--text)" : "var(--warm)",
                    color: m.from === "patient" ? "white" : "var(--text)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    borderRadius: 14,
                    borderTopRightRadius: m.from === "patient" ? 4 : 14,
                    borderTopLeftRadius: m.from === "agent" ? 4 : 14,
                  }}
                >
                  {m.text}
                </div>
                {m.from === "patient" && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: "0.05em",
                      marginTop: 4,
                      textAlign: "right",
                      paddingRight: 4,
                    }}
                  >
                    {time}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {typing && (
          <div
            className="tw-fade"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                background: "var(--warm)",
                borderRadius: 14,
                borderTopLeftRadius: 4,
              }}
            >
              <span className="tw-typing-dot" />
              <span className="tw-typing-dot" />
              <span className="tw-typing-dot" />
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div
          style={{
            padding: "0 28px 12px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              style={{
                padding: "6px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--text-2)",
                borderRadius: 14,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          padding: "14px 28px calc(20px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 16px",
            background: "var(--panel)",
            borderRadius: 22,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask anything, or send a thought…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              fontSize: 14,
              padding: "14px 0",
              color: "var(--text)",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sendMutation.isPending}
            style={{
              padding: "8px 18px",
              background: input.trim() ? "var(--text)" : "var(--border)",
              color: "white",
              border: "none",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 14,
              cursor: input.trim() && !sendMutation.isPending ? "pointer" : "default",
            }}
          >
            Send
          </button>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-3)",
            marginTop: 8,
            textAlign: "center",
            letterSpacing: "0.04em",
          }}
        >
          End-to-end encrypted, audit logged. You can delete any of your own
          messages.
        </div>
      </div>
    </div>
  );
}
