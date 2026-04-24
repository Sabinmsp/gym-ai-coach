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

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-center px-6 py-4">
        {/*
          Scale the phone so it fits most laptop viewports without scrolling.
          Outer box reserves the scaled footprint; inner box stays at the phone's
          natural 390x844 so internal layout math remains untouched.
        */}
        <div
          className="relative"
          style={{ width: 390 * 0.75, height: 844 * 0.75 }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: 390,
              height: 844,
              transform: "scale(0.75)",
              transformOrigin: "top left",
            }}
          >
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
        </div>
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
