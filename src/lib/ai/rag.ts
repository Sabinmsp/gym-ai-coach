import type { AskResponse, UserProfile } from "./types";
import { getVectorStore, isRealVectorStore } from "./vectorStore";
import { getProfileStore, isRealProfileStore } from "./profileStore";
import { generateAnswer, isOllamaUp } from "./llm";
import { buildSystemPrompt } from "./prompt";
import { LruCache, hashKey, normalizeQuestion } from "./cache";
import { rateLimit } from "./rateLimit";
import { RequestLogger } from "./logger";
import { isRealEmbeddings } from "./embeddings";

const answerCache = new LruCache<AskResponse>(200, 1000 * 60 * 30);

interface AskArgs {
  userId: string;
  question: string;
  clientKey: string;
  k?: number;
}

export async function ask({
  userId,
  question,
  clientKey,
  k = 4,
}: AskArgs): Promise<{
  status: number;
  body: AskResponse | { error: string; retryAfterMs?: number };
}> {
  const log = new RequestLogger();

  /* ------------------------------ 1. Rate limit ---------------------------- */
  const rl = rateLimit(`ask:${clientKey}`, 15, 60_000);
  if (!rl.allowed) {
    log.skip("rate-limit", "blocked");
    return {
      status: 429,
      body: { error: "Too many requests", retryAfterMs: rl.resetMs },
    };
  }
  log.step("rate-limit", () => ({ remaining: rl.remaining }), {
    remaining: rl.remaining,
    limit: rl.limit,
  });

  /* ---------------------------- 2. Load profile ---------------------------- */
  const profileStore = getProfileStore();
  const profile = await log.step<UserProfile>(
    `profile-load (${profileStore.name})`,
    async () => {
      const p = await profileStore.get(userId);
      if (!p) throw new Error(`No profile for ${userId}`);
      return p;
    }
  );

  /* ----------------------------- 3. Cache check ---------------------------- */
  const cacheKey = hashKey([
    profile.id,
    profile.goal,
    profile.experience,
    profile.injuries || "",
    normalizeQuestion(question),
  ]);

  const cached = await log.step("cache-get", () => answerCache.get(cacheKey));
  if (cached) {
    const totalMs = log.totalMs();
    return {
      status: 200,
      body: {
        answer: cached.answer,
        debug: {
          ...cached.debug,
          requestId: log.requestId,
          cacheHit: true,
          totalMs,
          steps: log.getSteps(),
          rateLimit: {
            remaining: rl.remaining,
            limit: rl.limit,
            resetMs: rl.resetMs,
          },
        },
      },
    };
  }

  /* -------------------------- 4. Retrieve chunks --------------------------- */
  const vector = getVectorStore();
  const retrieved = await log.step(
    `retrieve (${vector.name}, top-${k})`,
    () => vector.search(question, k),
    { embeddings: isRealEmbeddings() ? "openai" : "hashed-fallback" }
  );

  /* --------------------------- 5. Build prompt ----------------------------- */
  const systemPrompt = await log.step("build-prompt", () =>
    buildSystemPrompt(profile)
  );

  /* --------------------------- 6. Generate answer -------------------------- */
  const llm = await log.step(
    "llm-generate",
    () =>
      generateAnswer({
        systemPrompt,
        userQuestion: question,
        profile,
        chunks: retrieved,
      })
  );

  /* ----------------------------- 7. Cache put ------------------------------ */
  const response: AskResponse = {
    answer: llm.text,
    debug: {
      requestId: log.requestId,
      totalMs: 0,
      cacheHit: false,
      retrieved: retrieved.map((r) => ({
        id: r.id,
        title: r.title,
        score: Number(r.score.toFixed(3)),
      })),
      model: llm.model,
      steps: [],
      promptPreview: systemPrompt.slice(0, 420),
      rateLimit: {
        remaining: rl.remaining,
        limit: rl.limit,
        resetMs: rl.resetMs,
      },
    },
  };

  log.step("cache-put", () => {
    answerCache.set(cacheKey, response);
    return answerCache.size();
  });

  response.debug.totalMs = log.totalMs();
  response.debug.steps = log.getSteps();

  return { status: 200, body: response };
}

/** For the Profile screen to tell the user what's wired up. */
export async function getStackInfo() {
  const llm = process.env.OPENAI_API_KEY
    ? process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    : (await isOllamaUp())
    ? `Ollama / ${process.env.OLLAMA_MODEL ?? "qwen2.5:7b"}`
    : "Template fallback";

  return {
    vectorStore: isRealVectorStore() ? "Qdrant (cloud)" : "In-memory cosine",
    profileStore: isRealProfileStore() ? "Supabase" : "In-memory",
    embeddings: isRealEmbeddings()
      ? "OpenAI text-embedding-3-small"
      : "Hashed fallback (demo)",
    llm,
  };
}
