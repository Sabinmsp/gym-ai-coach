import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID, getProfileStore } from "@/lib/ai/profileStore";
import type { UserProfile } from "@/lib/ai/types";

export const runtime = "nodejs";

function normalize(input: Partial<UserProfile>): UserProfile {
  return {
    id: input.id ?? DEMO_USER_ID,
    name: String(input.name ?? "Alex Riley"),
    age: Number(input.age ?? 27),
    weightKg: Number(input.weightKg ?? 78),
    heightCm: Number(input.heightCm ?? 181),
    goal: String(input.goal ?? "Lean muscle gain"),
    diet: String(input.diet ?? "High-protein · Low sugar"),
    trainingDaysPerWeek: Number(input.trainingDaysPerWeek ?? 5),
    experience:
      (input.experience as UserProfile["experience"]) ?? "intermediate",
    injuries: String(input.injuries ?? ""),
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? DEMO_USER_ID;
  const store = getProfileStore();
  const profile = await store.get(id);
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  let body: Partial<UserProfile> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const profile = normalize(body);
  const store = getProfileStore();
  const saved = await store.upsert(profile);

  return NextResponse.json({ profile: saved });
}
