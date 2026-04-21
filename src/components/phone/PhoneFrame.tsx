"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * A realistic iPhone 15 Pro style frame. Pure CSS, no external assets.
 * The screen content renders inside a fixed-aspect viewport.
 */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Ambient glow behind the phone */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-70"
        style={{
          background:
            "radial-gradient(closest-side, rgba(163,255,18,0.22), transparent 70%)",
        }}
      />

      {/* Outer titanium bezel */}
      <div
        className={cn(
          "relative mx-auto",
          "w-[390px] h-[844px]",
          "rounded-[58px]",
          "p-[10px]",
          "shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.4)]"
        )}
        style={{
          background:
            "linear-gradient(145deg, #2a2d35 0%, #0d0f13 40%, #1c1f26 100%)",
        }}
      >
        {/* Inner body — the matte black band */}
        <div
          className="relative w-full h-full rounded-[50px] p-[3px]"
          style={{
            background:
              "linear-gradient(180deg, #0a0b0f 0%, #151820 50%, #0a0b0f 100%)",
          }}
        >
          {/* Screen */}
          <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-ink-950">
            {/* Status bar */}
            <StatusBar />

            {/* Dynamic Island */}
            <DynamicIsland />

            {/* Screen content */}
            <div className="absolute inset-0">{children}</div>

            {/* Home indicator */}
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[5px] w-[134px] rounded-full bg-white/85" />

            {/* Inner screen highlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[48px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 12%)",
              }}
            />
          </div>
        </div>

        {/* Side buttons — visual only */}
        <SideButton side="left" top="120px" height="32px" />
        <SideButton side="left" top="168px" height="64px" />
        <SideButton side="left" top="240px" height="64px" />
        <SideButton side="right" top="200px" height="100px" />
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-7 pt-4 text-[13px] font-semibold tracking-tight text-white/95">
      <span>9:41</span>
      <div className="flex items-center gap-1.5 opacity-95">
        {/* Signal */}
        <svg width="17" height="10" viewBox="0 0 17 10" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="3" rx="0.5" />
          <rect x="4.5" y="5" width="3" height="5" rx="0.5" />
          <rect x="9" y="2.5" width="3" height="7.5" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="10" rx="0.5" />
        </svg>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden>
          <path
            d="M7.5 10.3a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM3.4 6.9a5.9 5.9 0 018.2 0M0.7 4.2a9.8 9.8 0 0113.6 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {/* Battery */}
        <div className="relative ml-0.5 flex items-center">
          <div className="w-[24px] h-[11px] rounded-[3px] border border-white/70 relative">
            <div className="absolute top-[1.5px] left-[1.5px] bottom-[1.5px] w-[17px] rounded-[1.5px] bg-white/95" />
          </div>
          <div className="w-[1.5px] h-[4px] bg-white/70 rounded-r ml-[1px]" />
        </div>
      </div>
    </div>
  );
}

function DynamicIsland() {
  return (
    <div className="pointer-events-none absolute top-[11px] left-1/2 -translate-x-1/2 z-20 h-[36px] w-[125px] rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.03)]" />
  );
}

function SideButton({
  side,
  top,
  height,
}: {
  side: "left" | "right";
  top: string;
  height: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute w-[3px] rounded-full",
        side === "left" ? "-left-[3px]" : "-right-[3px]"
      )}
      style={{
        top,
        height,
        background:
          "linear-gradient(180deg, #3a3d45 0%, #1a1c21 50%, #3a3d45 100%)",
      }}
    />
  );
}
