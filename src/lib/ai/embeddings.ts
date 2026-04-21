/**
 * Embeddings with two strategies:
 *
 *  1. If OPENAI_API_KEY is set, call `text-embedding-3-small` (1536 dims).
 *  2. Otherwise, deterministic hashed bag-of-words embedding (256 dims).
 *
 * Both strategies produce L2-normalized vectors so the vector store's cosine
 * similarity is valid for either.
 */

const FALLBACK_DIMS = 256;

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
  if (process.env.OPENAI_API_KEY) {
    try {
      return await embedOpenAI(text);
    } catch (err) {
      console.warn(
        "[ai] OpenAI embeddings failed, falling back to local:",
        err
      );
    }
  }
  return embedFallback(text);
}

/** Did this request use real embeddings? */
export function isRealEmbeddings(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function cosineSim(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}
