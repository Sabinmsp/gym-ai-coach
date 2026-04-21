"use client";

import { Flame, Dumbbell, TrendingDown, Beef, Trophy } from "lucide-react";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { weeklyWorkouts, weightHistory, user } from "@/lib/data";
import { cn } from "@/lib/cn";

export function ProgressScreen() {
  const done = weeklyWorkouts.filter((d) => d.done).length;
  const total = weeklyWorkouts.filter((d) => d.label !== "Rest").length;
  const completionPct = done / total;

  return (
    <ScreenShell flair="progress">
      <div className="px-5 pt-14">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">
              Progress
            </h1>
            <div className="mt-0.5 text-[12px] text-white/50">
              Last 6 weeks · Everything trending up
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
            <Trophy size={12} />
            New PR
          </div>
        </div>

        {/* Streak */}
        <Card className="mt-4 p-4 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-300 ring-1 ring-orange-400/30">
                <Flame size={22} />
              </div>
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(251,146,60,0.4), transparent 70%)",
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Weekly streak
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-semibold tracking-tight">
                  {user.streakDays}
                </span>
                <span className="text-[13px] text-white/50">days</span>
              </div>
              <div className="mt-0.5 text-[12px] text-white/55">
                Longest yet. Keep it lit.
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {weeklyWorkouts.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-xl text-[10px] font-semibold tracking-tight transition-all",
                    d.done
                      ? "bg-brand/15 text-brand ring-1 ring-brand/40"
                      : d.label === "Rest"
                      ? "bg-white/[0.03] text-white/35 border border-dashed border-white/10"
                      : "bg-white/5 text-white/55 border border-white/8"
                  )}
                >
                  {d.done ? "✓" : d.label === "Rest" ? "·" : d.label[0]}
                </div>
                <div className="text-[10px] text-white/45">{d.day}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weight chart */}
        <Card className="mt-4 p-4 animate-slide-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/60">
                <TrendingDown size={14} className="text-brand" />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Weight
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[24px] font-semibold tracking-tight">
                  {weightHistory[weightHistory.length - 1].kg.toFixed(1)} kg
                </span>
                <span className="text-[12px] font-medium text-brand">
                  −2.2 kg
                </span>
              </div>
              <div className="text-[11px] text-white/45">
                vs. 6 weeks ago
              </div>
            </div>
            <Legend />
          </div>

          <WeightChart />
        </Card>

        {/* Workout completion */}
        <Card className="mt-4 p-4 animate-slide-up" style={{ animationDelay: "140ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/60">
                <Dumbbell size={14} />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Workout completion
                </span>
              </div>
              <div className="mt-1 text-[24px] font-semibold tracking-tight">
                {done} / {total}
                <span className="ml-1 text-[12px] font-medium text-white/45">
                  this week
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium text-brand">
                {Math.round(completionPct * 100)}%
              </div>
              <div className="text-[10px] text-white/40">adherence</div>
            </div>
          </div>
          <ProgressBar value={completionPct} className="mt-3" />
        </Card>

        {/* Protein target */}
        <Card className="mt-4 p-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-white/60">
              <Beef size={14} />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Protein target — 7 days
              </span>
            </div>
            <span className="text-[11px] font-medium text-brand">78% avg</span>
          </div>

          <div className="mt-4 grid grid-cols-7 items-end gap-2 h-24">
            {[70, 92, 85, 65, 78, 88, 95].map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand/40 to-brand"
                  style={{
                    height: `${v}%`,
                    boxShadow: "0 -4px 18px rgba(163,255,18,0.35)",
                  }}
                />
                <span className="text-[9.5px] text-white/40">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Records */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: "260ms" }}>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45 px-1">
            Personal records
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <PrCard lift="Bench press" value="102.5 kg" delta="+2.5 kg" />
            <PrCard lift="Squat" value="140 kg" delta="+5 kg" />
            <PrCard lift="Deadlift" value="170 kg" delta="+2.5 kg" />
            <PrCard lift="Pull-up" value="BW +20 kg" delta="+2.5 kg" />
          </div>
        </div>

        <div className="h-6" />
      </div>
    </ScreenShell>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-[10.5px] text-white/45">
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(163,255,18,0.8)]" />
        actual
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        target
      </span>
    </div>
  );
}

function WeightChart() {
  const W = 320;
  const H = 120;
  const pad = 8;
  const xs = weightHistory.map((_, i) => pad + (i * (W - pad * 2)) / (weightHistory.length - 1));
  const max = Math.max(...weightHistory.map((d) => d.kg));
  const min = Math.min(...weightHistory.map((d) => d.kg));
  const span = Math.max(0.5, max - min);
  const ys = weightHistory.map((d) => pad + (1 - (d.kg - min) / span) * (H - pad * 2));

  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");

  const area = `${path} L${xs[xs.length - 1]} ${H} L${xs[0]} ${H} Z`;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/6 bg-black/20">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-[120px]">
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#A3FF12" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#A3FF12" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#C6FF4A" />
            <stop offset="100%" stopColor="#A3FF12" />
          </linearGradient>
        </defs>
        {/* baseline grid */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={pad}
            x2={W - pad}
            y1={pad + p * (H - pad * 2)}
            y2={pad + p * (H - pad * 2)}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="3 4"
          />
        ))}
        <path d={area} fill="url(#areaGrad)" />
        <path
          d={path}
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(163,255,18,0.55))" }}
        />
        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={ys[i]}
            r={i === xs.length - 1 ? 4 : 2.5}
            fill={i === xs.length - 1 ? "#A3FF12" : "#fff"}
            opacity={i === xs.length - 1 ? 1 : 0.55}
          />
        ))}
      </svg>
    </div>
  );
}

function PrCard({
  lift,
  value,
  delta,
}: {
  lift: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">
        {lift}
      </div>
      <div className="mt-1 text-[16px] font-semibold tracking-tight">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-brand">{delta}</div>
    </div>
  );
}
