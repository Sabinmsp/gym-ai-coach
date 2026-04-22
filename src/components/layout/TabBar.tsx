"use client";

import { Home, Sparkles, User, LineChart } from "lucide-react";
import { cn } from "@/lib/cn";

export type TabKey = "home" | "ai" | "progress" | "profile";

interface TabBarProps {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "ai", label: "Ask AI", Icon: Sparkles },
  { key: "progress", label: "Progress", Icon: LineChart },
  { key: "profile", label: "Profile", Icon: User },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 pt-2 px-4">
      <div
        className="mx-auto flex items-center justify-between rounded-[28px] border border-white/8 bg-ink-900/70 px-3 py-2 backdrop-blur-2xl"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 40px -20px rgba(0,0,0,0.8)",
        }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "group relative flex-1 flex flex-col items-center gap-0.5 rounded-2xl py-2 transition-all",
                isActive ? "text-brand" : "text-white hover:text-white"
              )}
              aria-label={label}
            >
              <span
                className={cn(
                  "relative flex items-center justify-center h-9 w-9 rounded-2xl transition-all",
                  isActive && "bg-brand/10 ring-1 ring-brand/30"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={cn(
                    "transition-transform",
                    isActive && "scale-110 drop-shadow-[0_0_8px_rgba(163,255,18,0.6)]"
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[10.5px] font-medium tracking-wide transition-opacity",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
