"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, Mic, Plus, Zap } from "lucide-react";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { cn } from "@/lib/cn";
import type { AskDebug, AskResponse } from "@/lib/ai/types";

type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
  debug?: AskDebug;
  pending?: boolean;
  error?: boolean;
};

const WELCOME: Msg = {
  id: "welcome",
  role: "ai",
  text:
    "Hey Alex — I'm your Coach AI. I have your profile (goal, weight, injuries) and a fitness knowledge base. Ask me anything.\n\nTry: \"how much protein should I eat?\" or \"my shoulder is sore, what can I do?\"",
  time: nowTime(),
};

const SUGGESTIONS = [
  "How much protein for my goal?",
  "My shoulder is sore — what should I swap?",
  "Is creatine worth it?",
  "How do I break a bench plateau?",
];

export function AskAiScreen() {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || thinking) return;

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: question,
      time: nowTime(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.status === 429) {
        const j = (await res.json().catch(() => ({}))) as {
          retryAfterMs?: number;
        };
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "ai",
            text: `You're going fast — rate limit hit. Try again in ${Math.ceil(
              (j.retryAfterMs ?? 5000) / 1000
            )}s.`,
            time: nowTime(),
            error: true,
          },
        ]);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as AskResponse;
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          text: data.answer,
          time: nowTime(),
          debug: data.debug,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          text: "Something went wrong talking to the AI. Check the server logs.",
          time: nowTime(),
          error: true,
        },
      ]);
      console.error(err);
    } finally {
      setThinking(false);
    }
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
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold tracking-tight">
                Coach AI
              </div>
              <div className="text-[11px] text-emerald-400">
                Grounded on your profile · RAG
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
              <Zap size={10} />
              live
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

            {messages.length === 1 && !thinking && (
              <div className="mt-4">
                <div className="mb-2 text-center text-[10.5px] uppercase tracking-wider text-white">
                  Try asking
                </div>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left text-[13px] text-white transition-all hover:border-brand/30 hover:bg-brand/[0.05] hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pt-3 pb-6 bg-gradient-to-t from-ink-950 via-ink-950/95 to-transparent">
          <div className="flex items-end gap-2">
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
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
                  className="max-h-28 flex-1 resize-none bg-transparent text-[14px] text-white placeholder:text-white focus:outline-none"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all",
                    input.trim() && !thinking
                      ? "bg-brand text-ink-950 shadow-[0_0_16px_rgba(163,255,18,0.5)]"
                      : "bg-white/10 text-white"
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
          <div className="mt-2 text-center text-[10.5px] text-white">
            Grounded on your profile + knowledge base · no hallucinations
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function SystemHint() {
  return (
    <div className="mx-auto w-fit rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-white backdrop-blur">
      Today · now
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex w-full animate-slide-up flex-col",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm",
          isUser
            ? "bg-brand text-ink-950 rounded-br-md"
            : msg.error
            ? "bg-red-500/10 text-red-200 border border-red-500/20 rounded-bl-md"
            : "bg-white/[0.06] text-white border border-white/8 rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-wrap">{msg.text}</div>
        <div
          className={cn(
            "mt-1 text-[10px]",
            isUser ? "text-ink-950/50" : "text-white"
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
    <div className="flex flex-col items-start animate-fade-in">
      <div className="rounded-2xl rounded-bl-md border border-white/8 bg-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <Dot delay={0} />
            <Dot delay={120} />
            <Dot delay={240} />
          </div>
          <span className="text-[10.5px] text-white">
            retrieving · reasoning
          </span>
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

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
