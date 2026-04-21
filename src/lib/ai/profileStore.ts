import type { UserProfile } from "./types";

/**
 * Profile store abstraction. In-memory by default; swaps to Supabase when
 * SUPABASE_URL + SUPABASE_SERVICE_KEY are set. We hit Supabase via its REST
 * API (PostgREST) so we don't need to add the supabase-js dependency.
 *
 * Expected Supabase table:
 *   create table profiles (
 *     id text primary key,
 *     data jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 */
export interface ProfileStore {
  name: string;
  get(id: string): Promise<UserProfile | null>;
  upsert(profile: UserProfile): Promise<UserProfile>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: "demo-user",
  name: "Alex Riley",
  age: 27,
  weightKg: 78,
  heightCm: 181,
  goal: "Lean muscle gain",
  diet: "High-protein · Low sugar",
  trainingDaysPerWeek: 5,
  experience: "intermediate",
  injuries: "Mild left shoulder impingement — avoid heavy overhead press.",
  updatedAt: new Date().toISOString(),
};

/* ------------------------------ In-memory -------------------------------- */

class InMemoryProfileStore implements ProfileStore {
  name = "in-memory";
  private byId = new Map<string, UserProfile>([
    [DEFAULT_PROFILE.id, DEFAULT_PROFILE],
  ]);

  async get(id: string) {
    return this.byId.get(id) ?? null;
  }

  async upsert(profile: UserProfile) {
    const stored = { ...profile, updatedAt: new Date().toISOString() };
    this.byId.set(profile.id, stored);
    return stored;
  }
}

/* ------------------------------- Supabase -------------------------------- */

class SupabaseProfileStore implements ProfileStore {
  name = "supabase";
  private url: string;
  private key: string;

  constructor() {
    this.url = process.env.SUPABASE_URL!.replace(/\/$/, "");
    this.key = process.env.SUPABASE_SERVICE_KEY!;
  }

  private headers(extra: Record<string, string> = {}) {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  async get(id: string): Promise<UserProfile | null> {
    const res = await fetch(
      `${this.url}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}&select=data`,
      { headers: this.headers() }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ data: UserProfile }>;
    return rows[0]?.data ?? null;
  }

  async upsert(profile: UserProfile): Promise<UserProfile> {
    const stored = { ...profile, updatedAt: new Date().toISOString() };
    const res = await fetch(`${this.url}/rest/v1/profiles`, {
      method: "POST",
      headers: this.headers({
        Prefer: "resolution=merge-duplicates,return=representation",
      }),
      body: JSON.stringify([{ id: stored.id, data: stored }]),
    });
    if (!res.ok) throw new Error(`Supabase upsert failed: ${res.status}`);
    return stored;
  }
}

/* --------------------------------- Factory -------------------------------- */

let singleton: ProfileStore | null = null;

export function getProfileStore(): ProfileStore {
  if (singleton) return singleton;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    singleton = new SupabaseProfileStore();
  } else {
    singleton = new InMemoryProfileStore();
  }
  return singleton;
}

export function isRealProfileStore(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

export const DEMO_USER_ID = DEFAULT_PROFILE.id;
