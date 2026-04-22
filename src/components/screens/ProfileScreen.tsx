"use client";

import { Settings, Bell } from "lucide-react";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "@/components/ai/ProfileForm";

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

        <p className="mt-1 text-[12px] text-white">
          Your profile grounds every AI answer. Save it and ask the coach.
        </p>

        {/* Hero avatar card */}
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
                AR
              </div>
              <div className="pb-2">
                <div className="text-[17px] font-semibold tracking-tight">
                  Alex Riley
                </div>
                <div className="text-[12px] text-white">
                  Member since Jan 2025 · Pro plan
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        <div className="mt-5 animate-slide-up" style={{ animationDelay: "80ms" }}>
          <ProfileForm />
        </div>

        <div className="h-6" />
      </div>
    </ScreenShell>
  );
}

function IconBtn({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
      {...props}
    >
      {children}
    </button>
  );
}
