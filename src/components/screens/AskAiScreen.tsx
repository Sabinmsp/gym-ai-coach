"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, Mic, Plus } from "lucide-react";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { chatMessages } from "@/lib/data";
import { cn } from "@/lib/cn";

type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
};

export function AskAiScreen() {
  const [messages, setMessages] = useState<Msg[]>([...chatMessages]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, thinking]);

  function send() {
    const t = input.trim();
    if (!t) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    const id = `u-${Date.now()}`;
    setMessages((m) => [...m, { id, role: "user", text: t, time }]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const reply: Msg = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: mockReply(t),
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 900);
  }

  return (
    <ScreenShell flair="ai" withTabBar={false}>
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 pt-14 pb-3 px-5 bg-gradient-to-b from-ink-950 via-ink-950/95 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-glow to-brand text-ink-950 shadow-glow">
                <Sparkles size={18} strokeWidth={2.4} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-950" />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold tracking-tight">
                Coach AI
              </div>
              <div className="text-[11px] text-emerald-400">
                Online · Trained on 10M+ workouts
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto no-scrollbar px-4 pb-[120px]"
        >
          <div className="space-y-3">
            <SystemHint />
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {thinking && <TypingBubble />}
          </div>
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pt-3 pb-6 bg-gradient-to-t from-ink-950 via-ink-950/95 to-transparent">
          <div className="flex items-end gap-2">
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10"
              aria-label="Attach"
            >
              <Plus size={18} />
            </button>

            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur focus-within:border-brand/40 focus-within:ring-1 focus-within:ring-brand/30 transition-colors">
              <div className="flex items-end gap-2 px-3 py-2.5">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask your coach anything…"
                  className="max-h-28 flex-1 resize-none bg-transparent text-[14px] text-white placeholder:text-white/35 focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all",
                    input.trim()
                      ? "bg-brand text-ink-950 shadow-[0_0_16px_rgba(163,255,18,0.5)]"
                      : "bg-white/10 text-white/50"
                  )}
                  aria-label="Send"
                >
                  {input.trim() ? (
                    <ArrowUp size={16} strokeWidth={2.6} />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 text-center text-[10.5px] text-white/35">
            Coach AI can make mistakes. Always listen to your body.
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function SystemHint() {
  return (
    <div className="mx-auto w-fit rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-white/45 backdrop-blur">
      Today · 8:02 AM
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex w-full animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm",
          isUser
            ? "bg-brand text-ink-950 rounded-br-md"
            : "bg-white/[0.06] text-white border border-white/8 rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-wrap">{msg.text}</div>
        <div
          className={cn(
            "mt-1 text-[10px]",
            isUser ? "text-ink-950/50" : "text-white/35"
          )}
        >
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="rounded-2xl rounded-bl-md border border-white/8 bg-white/[0.06] px-4 py-3">
        <div className="flex gap-1.5">
          <Dot delay={0} />
          <Dot delay={120} />
          <Dot delay={240} />
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-brand"
      style={{
        animation: "pulseGlow 1.1s ease-in-out infinite",
        animationDelay: `${delay}ms`,
        opacity: 0.8,
      }}
    />
  );
}

function mockReply(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("protein"))
    return "Aim for 1.6–2.2g per kg bodyweight. For you that's roughly 160–190g/day. Spread it across 4 meals for best absorption.";
  if (lower.includes("sore") || lower.includes("pain"))
    return "Got it. Let's dial intensity back 20% today, swap any painful movement for a neutral variation, and add 10 min of mobility.";
  if (lower.includes("workout") || lower.includes("plan"))
    return "I've queued a 48-min push session tailored to your shoulder. Want me to add a finisher or keep it strict?";
  return "Good question. Based on your profile, here's what I'd do: focus on sleep first, then hit protein, then train hard 4–5x/week. Want me to detail any of those?";
}
