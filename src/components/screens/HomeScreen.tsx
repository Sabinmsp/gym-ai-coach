"use client";

import {
  Dumbbell,
  Apple,
  LineChart,
  Sparkles,
  Flame,
  Footprints,
  Droplet,
  ChevronRight,
} from "lucide-react";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { user, dailySummary } from "@/lib/data";
import type { TabKey } from "@/components/layout/TabBar";

interface HomeScreenProps {
  onNavigate: (t: TabKey) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const caloriePct =
    dailySummary.caloriesEaten / dailySummary.caloriesTarget;
  const proteinPct = dailySummary.proteinEaten / dailySummary.proteinTarget;
  const waterPct = dailySummary.waterDrunkL / dailySummary.waterTargetL;
  const stepsPct = dailySummary.steps / dailySummary.stepsTarget;

  return (
    <ScreenShell flair="home">
      <div className="px-5 pt-14">
        {/* Header greeting */}
        <div className="mt-2 flex items-center justify-between animate-fade-in">
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/45">
              Tuesday, Apr 21
            </div>
            <h1 className="mt-1 text-[26px] font-semibold tracking-tight">
              Good morning, {user.name}
            </h1>
          </div>
          <Avatar initials={user.avatarInitials} streak={user.streakDays} />
        </div>

        {/* Daily summary hero card */}
        <Card className="mt-5 overflow-hidden p-5 animate-slide-up">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(163,255,18,0.35), transparent 70%)",
            }}
          />
          <div className="relative flex items-center gap-5">
            <ProgressRing value={caloriePct} size={108} stroke={10}>
              <div className="text-center">
                <div className="text-[22px] font-semibold leading-none tracking-tight">
                  {Math.round(caloriePct * 100)}%
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/50">
                  daily goal
                </div>
              </div>
            </ProgressRing>

            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/45">
                Today
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[22px] font-semibold tracking-tight">
                  {dailySummary.caloriesEaten.toLocaleString()}
                </span>
                <span className="text-[13px] text-white/45">
                  / {dailySummary.caloriesTarget.toLocaleString()} kcal
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                <MicroStat
                  icon={<Flame size={12} />}
                  label="Active"
                  value={`${dailySummary.activeMinutes} min`}
                />
                <MicroStat
                  icon={<Footprints size={12} />}
                  label="Steps"
                  value={dailySummary.steps.toLocaleString()}
                />
              </div>
            </div>
          </div>

          <div className="hairline my-4" />

          <div className="grid grid-cols-2 gap-3">
            <MiniGoal
              label="Protein"
              value={`${dailySummary.proteinEaten}g`}
              target={`${dailySummary.proteinTarget}g`}
              pct={proteinPct}
            />
            <MiniGoal
              label="Water"
              value={`${dailySummary.waterDrunkL}L`}
              target={`${dailySummary.waterTargetL}L`}
              pct={waterPct}
              icon={<Droplet size={11} />}
            />
          </div>
        </Card>

        {/* Quick actions */}
        <div
          className="mt-6 grid grid-cols-2 gap-3 animate-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          <ActionTile
            label="Workout"
            sub="Push · 52 min"
            icon={<Dumbbell size={18} />}
            accent
            onClick={() => onNavigate("progress")}
          />
          <ActionTile
            label="Nutrition"
            sub="1,420 / 2,480"
            icon={<Apple size={18} />}
            onClick={() => onNavigate("progress")}
          />
          <ActionTile
            label="Progress"
            sub="+1.2 kg / mo"
            icon={<LineChart size={18} />}
            onClick={() => onNavigate("progress")}
          />
          <ActionTile
            label="Ask AI"
            sub="Coach online"
            icon={<Sparkles size={18} />}
            onClick={() => onNavigate("ai")}
          />
        </div>

        {/* Today's workout */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: "140ms" }}>
          <SectionHeader title="Today's workout" action="View plan" />
          <Card className="mt-3 p-0 overflow-hidden">
            <div className="relative p-4">
              <div
                aria-hidden
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(163,255,18,0.12), transparent 60%)",
                }}
              />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand ring-1 ring-brand/30">
                  <Dumbbell size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">
                    Push day · 6 exercises
                  </div>
                  <div className="mt-0.5 text-[16px] font-semibold tracking-tight">
                    Chest, Shoulders & Triceps
                  </div>
                  <div className="mt-1.5 text-[12px] text-white/55">
                    ~52 min · Moderate intensity
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/40" />
              </div>
              <div className="relative mt-4 flex items-center gap-3 text-[11px] text-white/55">
                <Tag>Bench press</Tag>
                <Tag>Incline DB</Tag>
                <Tag>Lateral raise</Tag>
                <span className="ml-auto text-white/35">+3 more</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Steps + water */}
        <div
          className="mt-5 grid grid-cols-2 gap-3 animate-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 text-white/60">
              <Footprints size={14} />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Steps
              </span>
            </div>
            <div className="mt-2 text-[20px] font-semibold tracking-tight">
              {dailySummary.steps.toLocaleString()}
            </div>
            <ProgressBar value={stepsPct} className="mt-3" height={6} />
            <div className="mt-2 text-[11px] text-white/45">
              Goal {dailySummary.stepsTarget.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-white/60">
              <Droplet size={14} />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Hydration
              </span>
            </div>
            <div className="mt-2 text-[20px] font-semibold tracking-tight">
              {dailySummary.waterDrunkL}L
            </div>
            <ProgressBar value={waterPct} className="mt-3" height={6} />
            <div className="mt-2 text-[11px] text-white/45">
              Goal {dailySummary.waterTargetL}L
            </div>
          </Card>
        </div>

        {/* AI nudge */}
        <Card
          className="mt-5 p-4 border-brand/20 bg-gradient-to-br from-brand/10 to-transparent animate-slide-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-ink-950 shadow-glow">
              <Sparkles size={16} strokeWidth={2.4} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold tracking-tight">
                Tip from your coach
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-white/70">
                You're 58g short on protein. A whey shake + Greek yogurt after
                your workout closes the gap.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ScreenShell>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      {action && (
        <button className="text-[12px] font-medium text-white/55 hover:text-white">
          {action}
        </button>
      )}
    </div>
  );
}

function Avatar({ initials, streak }: { initials: string; streak: number }) {
  return (
    <div className="relative">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-glow to-brand text-ink-950 text-[13px] font-bold tracking-tight shadow-[0_8px_20px_-8px_rgba(163,255,18,0.55)]">
        {initials}
      </div>
      <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-ink-900/90 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur ring-1 ring-white/10">
        <Flame size={9} className="text-orange-400" />
        {streak}
      </div>
    </div>
  );
}

function ActionTile({
  label,
  sub,
  icon,
  accent,
  onClick,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98] " +
        (accent
          ? "border-brand/25 bg-gradient-to-br from-brand/10 to-transparent"
          : "border-white/8 bg-white/[0.03]")
      }
    >
      <div
        className={
          "flex h-9 w-9 items-center justify-center rounded-xl ring-1 " +
          (accent
            ? "bg-brand text-ink-950 ring-brand/60 shadow-[0_6px_20px_-6px_rgba(163,255,18,0.7)]"
            : "bg-white/5 text-white ring-white/10")
        }
      >
        {icon}
      </div>
      <div className="mt-3 text-[14px] font-semibold tracking-tight">
        {label}
      </div>
      <div className="mt-0.5 text-[11.5px] text-white/50">{sub}</div>
      <ChevronRight
        size={14}
        className="absolute right-3 top-3 text-white/30 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}

function MicroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-white/60">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-white/70">
        {icon}
      </span>
      <span className="text-white/45">{label}</span>
      <span className="ml-auto font-medium text-white/85">{value}</span>
    </div>
  );
}

function MiniGoal({
  label,
  value,
  target,
  pct,
  icon,
}: {
  label: string;
  value: string;
  target: string;
  pct: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/50">
        {icon}
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[16px] font-semibold tracking-tight">
          {value}
        </span>
        <span className="text-[11px] text-white/40">/ {target}</span>
      </div>
      <ProgressBar value={pct} className="mt-2" height={5} />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/65">
      {children}
    </span>
  );
}
