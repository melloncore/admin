"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Circle } from "lucide-react";
import { PageHeader, PageLoading, EmptyState } from "@/components/ui/Feedback";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { conversationsApi, messagesApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo, formatDateTime, nowIso } from "@/lib/utils/date";
import type { ChatMessage, Conversation } from "@/types";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([conversationsApi.list(), messagesApi.list()]).then(([convos, msgs]) => {
      const sorted = [...convos].sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
      setConversations(sorted);
      setMessages(msgs);
      setActiveId(sorted[0]?.id ?? null);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeId, messages]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeMessages = messages
    .filter((m) => m.conversationId === activeId)
    .sort((a, b) => +new Date(a.sentAt) - +new Date(b.sentAt));

  const selectConversation = async (id: string) => {
    setActiveId(id);
    const convo = conversations.find((c) => c.id === id);
    if (convo && convo.unreadCount > 0) {
      const updated = await conversationsApi.update(id, { unreadCount: 0 });
      if (updated) {
        setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
      }
    }
  };

  const handleSend = async () => {
    if (!draft.trim() || !activeId) return;
    const created = await messagesApi.create({
      conversationId: activeId,
      sender: "admin",
      body: draft.trim(),
      sentAt: nowIso(),
    });
    setMessages((prev) => [...prev, created]);
    const updated = await conversationsApi.update(activeId, {
      lastMessage: draft.trim(),
      lastMessageAt: nowIso(),
    });
    if (updated) {
      setConversations((prev) =>
        [...prev.map((c) => (c.id === activeId ? updated : c))].sort(
          (a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt),
        ),
      );
    }
    setDraft("");
  };

  if (isLoading) return <PageLoading />;

  return (
    <div>
      <PageHeader title="Messages" description="Chat with customers who reach out through the site." />

      <Card className="grid grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]" style={{ height: 560 }}>
        <div className="flex flex-col overflow-y-auto border-b border-line md:border-b-0 md:border-r">
          {conversations.length === 0 ? (
            <EmptyState title="No conversations yet" />
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={cn(
                  "flex items-start gap-3 border-b border-line px-4 py-3 text-left transition hover:bg-paper",
                  activeId === c.id && "bg-paper",
                )}
              >
                <Avatar name={c.customerName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink">{c.customerName}</p>
                    {c.unreadCount > 0 && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-coral-500" />
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-muted">{c.lastMessage}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{timeAgo(c.lastMessageAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          {!activeConversation ? (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-muted">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={activeConversation.customerName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-ink">{activeConversation.customerName}</p>
                    <p className="text-xs text-ink-muted">{activeConversation.customerEmail}</p>
                  </div>
                </div>
                <Badge tone={activeConversation.status === "open" ? "success" : "neutral"}>
                  <Circle size={8} fill="currentColor" /> {activeConversation.status}
                </Badge>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {activeMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.sender === "admin" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        message.sender === "admin"
                          ? "rounded-br-sm bg-brand-700 text-white"
                          : "rounded-bl-sm bg-paper text-ink",
                      )}
                    >
                      <p>{message.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          message.sender === "admin" ? "text-white/70" : "text-ink-muted",
                        )}
                      >
                        {formatDateTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-line px-4 py-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder={`Message ${activeConversation.customerName.split(" ")[0]}…`}
                  className="flex-1 rounded-full border border-line px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Button size="sm" onClick={handleSend} aria-label="Send message">
                  <Send size={15} />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
      <p className="mt-2 text-xs text-ink-muted">
        Signed in as {user?.name}. Messages sync from the public site's chat widget once the API is connected.
      </p>
    </div>
  );
}
