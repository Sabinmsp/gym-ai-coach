"use client";

import { ArrowRight, Dumbbell, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-ink-950">
      {/* Hero gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(163,255,18,0.18) 0%, transparent 55%), radial-gradient(100% 60% at 50% 100%, rgba(80,120,255,0.18) 0%, transparent 60%)",
        }}
      />

      {/* Animated grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col px-7 pt-24 pb-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 animate-fade-in">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Gym AI Coach
          </span>
        </div>

        {/* Hero copy */}
        <div className="mt-14 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            <Sparkles size={12} className="text-brand" />
            <span>AI-powered · Personalized daily</span>
          </div>

          <h1 className="mt-5 text-[40px] leading-[1.05] font-semibold tracking-tight text-balance">
            Your pocket{" "}
            <span className="text-gradient-brand">personal trainer</span>.
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-white text-balance">
            Smart workouts, nutrition and recovery tuned to your body — so you
            show up, lift better, and actually see progress.
          </p>
        </div>

        {/* Feature pills */}
        <div className="mt-8 space-y-2.5 animate-slide-up" style={{ animationDelay: "120ms" }}>
          <FeatureRow
            icon={<Dumbbell size={16} />}
            label="Adaptive workouts"
            sub="Adjusts to injuries, gear and energy"
          />
          <FeatureRow
            icon={<Sparkles size={16} />}
            label="24/7 AI coach"
            sub="Ask anything, get expert answers"
          />
          <FeatureRow
            icon={<ShieldCheck size={16} />}
            label="Progress that compounds"
            sub="Weekly streaks, weight, PRs"
          />
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <div className="animate-slide-up" style={{ animationDelay: "220ms" }}>
          <Button size="lg" glow fullWidth onClick={onStart}>
            Get Started
            <ArrowRight size={18} strokeWidth={2.4} />
          </Button>
          <p className="mt-3 text-center text-[12px] text-white">
            No credit card · 7-day free trial
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 backdrop-blur">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/25">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold tracking-tight">{label}</div>
        <div className="text-[12px] text-white">{sub}</div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-glow to-brand text-ink-950 shadow-glow">
      <Dumbbell size={18} strokeWidth={2.6} />
    </div>
  );
}
