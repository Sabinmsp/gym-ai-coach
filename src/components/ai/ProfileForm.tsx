"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserProfile } from "@/lib/ai/types";

interface Props {
  onSaved?: (p: UserProfile) => void;
}

const EMPTY: UserProfile = {
  id: "demo-user",
  name: "Alex Riley",
  age: 27,
  weightKg: 78,
  heightCm: 181,
  goal: "Lean muscle gain",
  diet: "High-protein · Low sugar",
  trainingDaysPerWeek: 5,
  experience: "intermediate",
  injuries: "",
  updatedAt: "",
};

export function ProfileForm({ onSaved }: Props) {
  const [profile, setProfile] = useState<UserProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d: { profile: UserProfile | null }) => {
        if (d.profile) setProfile(d.profile);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as { profile: UserProfile };
      setProfile(j.profile);
      setJustSaved(true);
      onSaved?.(j.profile);
      setTimeout(() => setJustSaved(false), 1400);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function field<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-white">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Name"
          value={profile.name}
          onChange={(v) => field("name", v)}
          colSpan
        />
        <Input
          label="Age"
          type="number"
          value={String(profile.age)}
          onChange={(v) => field("age", Number(v))}
        />
        <Select
          label="Experience"
          value={profile.experience}
          onChange={(v) =>
            field("experience", v as UserProfile["experience"])
          }
          options={[
            { v: "beginner", l: "Beginner" },
            { v: "intermediate", l: "Intermediate" },
            { v: "advanced", l: "Advanced" },
          ]}
        />
        <Input
          label="Weight (kg)"
          type="number"
          value={String(profile.weightKg)}
          onChange={(v) => field("weightKg", Number(v))}
        />
        <Input
          label="Height (cm)"
          type="number"
          value={String(profile.heightCm)}
          onChange={(v) => field("heightCm", Number(v))}
        />
        <Input
          label="Training days / week"
          type="number"
          value={String(profile.trainingDaysPerWeek)}
          onChange={(v) => field("trainingDaysPerWeek", Number(v))}
          colSpan
        />
        <Input
          label="Goal"
          value={profile.goal}
          onChange={(v) => field("goal", v)}
          colSpan
        />
        <Input
          label="Diet preference"
          value={profile.diet}
          onChange={(v) => field("diet", v)}
          colSpan
        />
        <Textarea
          label="Injuries / notes"
          value={profile.injuries}
          onChange={(v) => field("injuries", v)}
        />
      </div>

      <button
        disabled={saving}
        onClick={save}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-[14px] tracking-tight transition-all active:scale-[0.98]",
          justSaved
            ? "bg-emerald-400 text-ink-950"
            : "bg-brand text-ink-950 hover:bg-brand-glow shadow-[0_8px_24px_-8px_rgba(163,255,18,0.55)]"
        )}
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Saving…
          </>
        ) : justSaved ? (
          <>
            <Check size={16} /> Saved
          </>
        ) : (
          <>
            <Save size={14} /> Save profile
          </>
        )}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  colSpan,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  colSpan?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2",
        colSpan && "col-span-2"
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-white">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[13px] text-white focus:outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ v: string; l: string }>;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[13px] text-white focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v} className="bg-ink-900">
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="col-span-2 flex flex-col gap-1 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white">
        {label}
      </span>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none bg-transparent text-[13px] text-white focus:outline-none"
        placeholder="e.g. mild left shoulder impingement — avoid heavy overhead press"
      />
    </label>
  );
}

