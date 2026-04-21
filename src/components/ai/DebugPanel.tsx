"use client";

import { useState } from "react";
import {
  ChevronDown,
  Zap,
  ShieldCheck,
  Database,
  Search,
  Brain,
  Timer,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AskDebug } from "@/lib/ai/types";

interface Props {
  debug: AskDebug;
}

export function DebugPanel({ debug }: Props) {
  const [open, setOpen] = useState(true);

  const StepIcon = (name: string) => {
    if (name.startsWith("rate-limit")) return ShieldCheck;
    if (name.startsWith("profile")) return Database;
    if (name.startsWith("cache")) return HardDrive;
    if (name.startsWith("retrieve")) return Search;
    if (name.startsWith("build-prompt")) return Brain;
    if (name.startsWith("llm")) return Zap;
    return Timer;
  };

  return (
    <div className="mt-2 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/15 text-brand ring-1 ring-brand/30">
            <Zap size={12} />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
              AI pipeline
            </div>
            <div className="text-[10.5px] text-white/45">
              {debug.totalMs} ms ·{" "}
              {debug.cacheHit ? "cache hit" : `${debug.retrieved.length} chunks`}{" "}
              · {debug.model}
            </div>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-white/40 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-white/6 p-3 space-y-3">
          {/* Stage list */}
          <div className="space-y-1.5">
            {debug.steps.map((s, i) => {
              const Icon = StepIcon(s.name);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-white/6 bg-black/20 px-2.5 py-1.5"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md ring-1",
                      s.status === "ok"
                        ? "bg-brand/10 text-brand ring-brand/30"
                        : s.status === "skipped"
                        ? "bg-white/5 text-white/50 ring-white/10"
                        : "bg-red-500/10 text-red-300 ring-red-500/30"
                    )}
                  >
                    <Icon size={10} />
                  </span>
                  <span className="flex-1 truncate text-[11.5px] text-white/80">
                    {s.name}
                  </span>
                  <span className="font-mono text-[10.5px] text-white/45">
                    {s.durationMs}ms
                  </span>
                </div>
              );
            })}
          </div>

          {/* Retrieved chunks */}
          {!debug.cacheHit && debug.retrieved.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                Retrieved context
              </div>
              <div className="space-y-1">
                {debug.retrieved.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5"
                  >
                    <span className="rounded-md bg-brand/10 px-1.5 py-0.5 font-mono text-[9.5px] text-brand ring-1 ring-brand/25">
                      {r.score.toFixed(2)}
                    </span>
                    <span className="truncate text-[11px] text-white/75">
                      {r.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rate limit */}
          <div className="flex items-center justify-between rounded-lg bg-black/20 px-2.5 py-1.5 text-[10.5px]">
            <span className="text-white/55">Rate limit</span>
            <span className="font-mono text-white/75">
              {debug.rateLimit.remaining}/{debug.rateLimit.limit} left ·
              resets in {Math.round(debug.rateLimit.resetMs / 1000)}s
            </span>
          </div>

          {/* System prompt peek */}
          <details className="group rounded-lg bg-black/20 px-2.5 py-1.5">
            <summary className="cursor-pointer list-none text-[10.5px] text-white/55">
              System prompt preview ▾
            </summary>
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-white/65">
              {debug.promptPreview}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
