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
        <Card className="mt-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-glow to-brand text-ink-950 text-[16px] font-bold tracking-tight">
              AR
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[16px] font-semibold tracking-tight text-white">
                Alex Riley
              </div>
              <div className="mt-0.5 truncate text-[12px] text-white/70">
                Member since Jan 2025 · Pro plan
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
