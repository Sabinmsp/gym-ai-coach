"use client";

import { useState } from "react";
import { Dumbbell, Github } from "lucide-react";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { TabBar, TabKey } from "@/components/layout/TabBar";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { AskAiScreen } from "@/components/screens/AskAiScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { ProgressScreen } from "@/components/screens/ProgressScreen";

type AppState = "welcome" | TabKey;

export default function Page() {
  const [state, setState] = useState<AppState>("welcome");

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-white text-ink-900">
      {/* Soft ambient tints so pure white still feels premium */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[620px] w-[900px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(163,255,18,0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[700px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(80,120,255,0.10), transparent 70%)",
        }}
      />

      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,13,18,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,13,18,0.06) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <TopNav />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
        {/* Left copy */}
        <SideCopy />

        {/* Phone */}
        <div className="flex items-center justify-center py-6">
          <PhoneFrame>
            {state === "welcome" ? (
              <WelcomeScreen onStart={() => setState("home")} />
            ) : (
              <>
                {state === "home" && <HomeScreen onNavigate={setState} />}
                {state === "ai" && <AskAiScreen />}
                {state === "progress" && <ProgressScreen />}
                {state === "profile" && <ProfileScreen />}

                <TabBar active={state} onChange={setState} />
              </>
            )}
          </PhoneFrame>
        </div>

        {/* Right highlights */}
        <RightHighlights />
      </div>

      <Footer />
    </main>
  );
}

function TopNav() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 lg:px-10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-glow to-brand text-ink-950 shadow-[0_6px_18px_-4px_rgba(163,255,18,0.55)]">
          <Dumbbell size={16} strokeWidth={2.6} />
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-ink-900">
          Gym AI Coach
        </span>
        <span className="ml-2 rounded-full border border-ink-900/10 bg-ink-900/[0.03] px-2 py-0.5 text-[10px] font-medium text-ink-900/55">
          Mockup
        </span>
      </div>
      <a
        href="https://github.com/Sabinmsp/gym-ai-coach"
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-1.5 text-[12.5px] text-ink-900/60 transition-colors hover:text-ink-900 sm:inline-flex"
      >
        <Github size={14} /> View source
      </a>
    </header>
  );
}

function SideCopy() {
  return (
    <div className="hidden lg:flex flex-col justify-center pr-6 text-ink-900">
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ink-900/10 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-ink-900/70 backdrop-blur shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(163,255,18,0.9)]" />
        Portfolio · iOS-style mockup
      </div>
      <h2 className="mt-5 text-[40px] leading-[1.05] font-semibold tracking-tight text-balance">
        A fitness app that{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #3f8a00 0%, #5fcc00 100%)",
          }}
        >
          thinks with you
        </span>
        .
      </h2>
      <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-900/60 text-balance">
        Tap the <span className="font-semibold text-ink-900">Get Started</span>{" "}
        button to explore Home, Ask AI, Progress and Profile — all inside a
        realistic iPhone frame.
      </p>

      <div className="mt-7 space-y-2.5 max-w-sm">
        <LineItem label="Next.js · TypeScript · Tailwind" />
        <LineItem label="Fully responsive mobile UI" />
        <LineItem label="Glassmorphism · glow accents · motion" />
      </div>
    </div>
  );
}

function RightHighlights() {
  return (
    <div className="hidden lg:flex flex-col justify-center pl-6">
      <Highlight
        title="Ask AI"
        body="Chat interface with typing indicator, contextual replies, and premium composer."
      />
      <Highlight
        title="Progress"
        body="Weekly streak grid, SVG weight chart with glow, and protein trend bars."
      />
      <Highlight
        title="Home"
        body="Daily summary ring, quick actions, hydration, steps and AI nudge."
      />
    </div>
  );
}

function Highlight({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-3 rounded-2xl border border-ink-900/8 bg-white/80 p-4 backdrop-blur shadow-[0_2px_8px_-2px_rgba(11,13,18,0.06)]">
      <div
        className="text-[11px] font-medium uppercase tracking-[0.12em]"
        style={{ color: "#5a9600" }}
      >
        {title}
      </div>
      <div className="mt-1 text-[13.5px] leading-relaxed text-ink-900/75">
        {body}
      </div>
    </div>
  );
}

function LineItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-900/70">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-md bg-brand/25 ring-1 ring-brand/40"
        style={{ color: "#3f8a00" }}
      >
        ✓
      </span>
      {label}
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-ink-900/5 bg-white/70 px-6 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between text-[11.5px] text-ink-900/45">
        <span>Gym AI Coach — UI mockup · Dummy data only</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
