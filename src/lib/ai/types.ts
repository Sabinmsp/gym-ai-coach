export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  goal: string;
  diet: string;
  trainingDaysPerWeek: number;
  experience: "beginner" | "intermediate" | "advanced";
  injuries: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  topic: string;
  title: string;
  text: string;
  /** Pre-computed embedding (populated at seed time) */
  embedding?: number[];
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

/** Each stage we want to surface in the UI to show the pipeline */
export interface PipelineStep {
  name: string;
  status: "ok" | "skipped" | "error";
  durationMs: number;
  detail?: string;
  meta?: Record<string, unknown>;
}

export interface AskDebug {
  requestId: string;
  totalMs: number;
  cacheHit: boolean;
  retrieved: Array<{ id: string; title: string; score: number }>;
  model: string;
  steps: PipelineStep[];
  promptPreview: string;
  rateLimit: { remaining: number; limit: number; resetMs: number };
}

export interface AskResponse {
  answer: string;
  debug: AskDebug;
}
