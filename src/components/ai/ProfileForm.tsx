"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save, Sparkles, Database, Search, Brain } from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserProfile } from "@/lib/ai/types";

interface Props {
  onSaved?: (p: UserProfile) => void;
}

type StackInfo = {
  vectorStore: string;
  profileStore: string;
  embeddings: string;
  llm: string;
};

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
  const [stack, setStack] = useState<StackInfo | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(
        (d: {
          profile: UserProfile | null;
          stack: StackInfo;
          storeName: string;
        }) => {
          if (d.profile) setProfile(d.profile);
          setStack(d.stack);
          setStoreName(d.storeName);
        }
      )
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
      const j = (await res.json()) as {
        profile: UserProfile;
        storeName: string;
      };
      setProfile(j.profile);
      setStoreName(j.storeName);
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
      {/* Stack badges — where the engineering lives */}
      {stack && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            <Sparkles size={10} className="text-brand" />
            AI stack
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
            <StackRow
              icon={<Database size={10} />}
              label="Profile"
              value={stack.profileStore}
            />
            <StackRow
              icon={<Search size={10} />}
              label="Vectors"
              value={stack.vectorStore}
            />
            <StackRow
              icon={<Brain size={10} />}
              label="Embeddings"
              value={stack.embeddings}
            />
            <StackRow
              icon={<Sparkles size={10} />}
              label="LLM"
              value={stack.llm}
            />
          </div>
          <div className="mt-2 text-[10px] text-white">
            Writes go to: <span className="text-white">{storeName}</span>
          </div>
        </div>
      )}

      {/* Editable fields */}
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
          label="Injuries / notes (fed to AI on every question)"
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

function StackRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-black/20 px-2 py-1.5">
      <span className="flex h-4 w-4 items-center justify-center rounded-md bg-brand/10 text-brand ring-1 ring-brand/25">
        {icon}
      </span>
      <span className="text-white">{label}</span>
      <span className="ml-auto truncate font-medium text-white">
        {value}
      </span>
    </div>
  );
}
