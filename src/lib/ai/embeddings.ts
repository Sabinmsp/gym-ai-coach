/**
 * Embeddings with three strategies, picked at runtime in this priority order:
 *
 *  1. OpenAI `text-embedding-3-small` (1536 dims) — if OPENAI_API_KEY is set.
 *  2. Ollama `nomic-embed-text` (768 dims) — if EMBEDDINGS_PROVIDER=ollama and
 *     Ollama is reachable. Real semantic embeddings, fully local.
 *  3. Deterministic hashed bag-of-words (256 dims) — zero-config fallback.
 *
 * All strategies produce L2-normalized vectors so cosine similarity is valid
 * regardless of which is active. The active dimension count is exposed via
 * `getEmbedDim()` so vector stores can size their columns correctly.
 */

const FALLBACK_DIMS = 256;
const OLLAMA_EMBED_DIMS = 768;
const OPENAI_EMBED_DIMS = 1536;

const STOPWORDS = new Set<string>([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "to",
  "of",
  "in",
  "on",
  "for",
  "at",
  "by",
  "with",
  "about",
  "as",
  "from",
  "this",
  "that",
  "these",
  "those",
  "be",
  "been",
  "being",
  "do",
  "does",
  "did",
  "how",
  "what",
  "why",
  "when",
  "where",
  "i",
  "me",
  "my",
  "you",
  "your",
  "we",
  "our",
  "it",
  "its",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Tiny deterministic hash → [0, mod)
 * Based on FNV-1a. Good enough for demo retrieval.
 */
function hashToBucket(token: string, mod: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % mod;
}

function normalize(vec: number[]): number[] {
  let sum = 0;
  for (const v of vec) sum += v * v;
  const norm = Math.sqrt(sum) || 1;
  return vec.map((v) => v / norm);
}

export function embedFallback(text: string): number[] {
  const tokens = tokenize(text);
  const vec = new Array(FALLBACK_DIMS).fill(0);
  if (tokens.length === 0) return vec;

  // Tri-gram + unigram sparse features, weighted by inverse length
  for (const t of tokens) {
    vec[hashToBucket(t, FALLBACK_DIMS)] += 1;
    if (t.length > 3) {
      for (let i = 0; i < t.length - 2; i++) {
        vec[hashToBucket(t.slice(i, i + 3), FALLBACK_DIMS)] += 0.3;
      }
    }
  }
  return normalize(vec);
}

/* -------------------------------- Ollama --------------------------------- */

const OLLAMA_EMBED_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text";

let ollamaEmbedCheckedAt = 0;
let ollamaEmbedIsUp = false;

async function isOllamaEmbedUp(): Promise<boolean> {
  if (Date.now() - ollamaEmbedCheckedAt < 30_000) return ollamaEmbedIsUp;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 800);
    const res = await fetch(`${OLLAMA_EMBED_URL}/api/tags`, {
      signal: ctrl.signal,
    });
    clearTimeout(to);
    ollamaEmbedIsUp = res.ok;
  } catch {
    ollamaEmbedIsUp = false;
  }
  ollamaEmbedCheckedAt = Date.now();
  return ollamaEmbedIsUp;
}

async function embedOllama(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_EMBED_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text }),
  });
  if (!res.ok) {
    throw new Error(`Ollama embeddings failed: ${res.status}`);
  }
  const data = (await res.json()) as { embedding: number[] };
  return normalize(data.embedding);
}

async function embedOpenAI(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small",
      input: text,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI embeddings failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return normalize(data.data[0].embedding);
}

export async function embed(text: string): Promise<number[]> {
  const provider = await activeProvider();

  if (provider === "openai") {
    try {
      return await embedOpenAI(text);
    } catch (err) {
      console.warn(
        "[ai] OpenAI embeddings failed, falling back to local:",
        err
      );
    }
  }

  if (provider === "ollama") {
    try {
      return await embedOllama(text);
    } catch (err) {
      console.warn(
        "[ai] Ollama embeddings failed, falling back to hashed:",
        err
      );
    }
  }

  return embedFallback(text);
}

export type EmbedProvider = "openai" | "ollama" | "hashed";

/** Decide which provider to use for this process. Cached after first call. */
let providerCache: EmbedProvider | null = null;
async function activeProvider(): Promise<EmbedProvider> {
  if (providerCache) return providerCache;
  if (process.env.OPENAI_API_KEY) {
    providerCache = "openai";
  } else if (
    process.env.EMBEDDINGS_PROVIDER === "ollama" &&
    (await isOllamaEmbedUp())
  ) {
    providerCache = "ollama";
  } else {
    providerCache = "hashed";
  }
  return providerCache;
}

/** Did this request use real embeddings (OpenAI or Ollama)? */
export function isRealEmbeddings(): boolean {
  return providerCache === "openai" || providerCache === "ollama";
}

/** Human-readable label for the active embedding provider. */
export async function getEmbedProvider(): Promise<EmbedProvider> {
  return activeProvider();
}

/** Vector dimension of the active embedding provider. */
export async function getEmbedDim(): Promise<number> {
  const p = await activeProvider();
  if (p === "openai") return OPENAI_EMBED_DIMS;
  if (p === "ollama") return OLLAMA_EMBED_DIMS;
  return FALLBACK_DIMS;
}

export function cosineSim(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}
