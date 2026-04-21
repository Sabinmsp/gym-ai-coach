"use client";

import {
  Target,
  Apple,
  CalendarDays,
  Activity,
  Settings,
  Bell,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { Card } from "@/components/ui/Card";
import { user } from "@/lib/data";

export function ProfileScreen() {
  return (
    <ScreenShell flair="profile">
      <div className="px-5 pt-14">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight">Profile</h1>
          <div className="flex items-center gap-2">
            <IconBtn aria-label="Notifications">
              <Bell size={16} />
            </IconBtn>
            <IconBtn aria-label="Settings">
              <Settings size={16} />
            </IconBtn>
          </div>
        </div>

        {/* Hero profile card */}
        <Card className="mt-4 overflow-hidden p-0 animate-slide-up">
          <div
            className="relative h-20 w-full"
            style={{
              background:
                "radial-gradient(100% 140% at 20% 0%, rgba(163,255,18,0.35), transparent 60%), linear-gradient(135deg, #12151C 0%, #0B0D12 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
                maskImage:
                  "radial-gradient(ellipse at top left, black 40%, transparent 70%)",
              }}
            />
          </div>

          <div className="px-4 pb-4 -mt-10">
            <div className="flex items-end gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-glow to-brand text-ink-950 text-[22px] font-bold tracking-tight ring-4 ring-ink-900 shadow-[0_12px_30px_-10px_rgba(163,255,18,0.6)]">
                {user.avatarInitials}
              </div>
              <div className="pb-2">
                <div className="text-[17px] font-semibold tracking-tight">
                  {user.name} Riley
                </div>
                <div className="text-[12px] text-white/50">
                  Member since Jan 2025 · Pro plan
                </div>
              </div>
              <button
                className="ml-auto mb-2 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11.5px] font-medium text-white/80 hover:bg-white/10"
                aria-label="Edit profile"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatBlock label="Age" value={`${user.age}`} />
              <StatBlock label="Height" value={`${user.heightCm} cm`} />
              <StatBlock label="Weight" value={`${user.weightKg} kg`} />
            </div>
          </div>
        </Card>

        {/* Info rows */}
        <div className="mt-5 space-y-3 animate-slide-up" style={{ animationDelay: "80ms" }}>
          <InfoRow
            icon={<Target size={16} />}
            title="Goal"
            value={user.goal}
          />
          <InfoRow
            icon={<Apple size={16} />}
            title="Diet preference"
            value={user.diet}
          />
          <InfoRow
            icon={<CalendarDays size={16} />}
            title="Training days"
            value={user.trainingDays.join(" · ")}
          />
          <InfoRow
            icon={<Activity size={16} />}
            title="Activity level"
            value="Moderately active · Lifts 5x/week"
          />
        </div>

        {/* Injuries card */}
        <Card className="mt-5 border-amber-400/20 bg-amber-400/[0.04] animate-slide-up" style={{ animationDelay: "140ms" }}>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30">
              <AlertTriangle size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-amber-300/80">
                Injuries & notes
              </div>
              <div className="mt-1 text-[13.5px] leading-relaxed text-white/80">
                {user.injuries}
              </div>
              <button className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-amber-300 hover:text-amber-200">
                <Pencil size={11} /> Update notes
              </button>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45 px-1">
            Preferences
          </div>
          <Card className="mt-2 p-0 divide-y divide-white/6">
            <PrefRow label="Units" value="Metric (kg, cm)" />
            <PrefRow label="Weekly check-ins" value="Sunday 8:00 AM" />
            <PrefRow label="AI voice coach" value="Enabled" accent />
          </Card>
        </div>

        <div className="h-6" />
      </div>
    </ScreenShell>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3 text-center">
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div className="mt-1 text-[16px] font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] p-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/25">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[14px] font-medium text-white/90">
          {value}
        </div>
      </div>
    </div>
  );
}

function PrefRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[14px] text-white/85">{label}</span>
      <span
        className={
          "text-[12.5px] font-medium " +
          (accent ? "text-brand" : "text-white/55")
        }
      >
        {value}
      </span>
    </div>
  );
}

function IconBtn({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
      {...props}
    >
      {children}
    </button>
  );
}
