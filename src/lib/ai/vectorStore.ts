import type { KnowledgeChunk, RetrievedChunk } from "./types";
import { KNOWLEDGE_CHUNKS } from "./knowledgeBase";
import {
  embed,
  cosineSim,
  isRealEmbeddings,
  tokenize,
  getEmbedProvider,
  getEmbedDim,
} from "./embeddings";

/**
 * Vector store abstraction. Default = in-memory cosine similarity.
 * If QDRANT_URL + QDRANT_API_KEY are set we'll use Qdrant REST.
 */
export interface VectorStore {
  name: string;
  search(query: string, k: number): Promise<RetrievedChunk[]>;
  ready(): Promise<void>;
}

/* ------------------------ In-memory implementation ------------------------ */

class InMemoryStore implements VectorStore {
  name = "in-memory";
  private seeded = false;
  private chunks: KnowledgeChunk[] = [];

  // BM25 lexical index — used as a strong signal when real embeddings aren't wired.
  private termFreq: Array<Map<string, number>> = [];
  private docFreq = new Map<string, number>();
  private avgDocLen = 0;
  private docLens: number[] = [];

  async ready() {
    if (this.seeded) return;

    // Pre-embed all chunks once per process. embed() routes to the active
    // provider (OpenAI / Ollama / hashed fallback) automatically.
    for (const c of KNOWLEDGE_CHUNKS) {
      this.chunks.push({ ...c, embedding: await embed(c.text) });
    }

    // Build BM25 index over title + text (title weighted 3x).
    let totalLen = 0;
    for (const c of this.chunks) {
      const tokens = [
        ...tokenize(c.title),
        ...tokenize(c.title),
        ...tokenize(c.title),
        ...tokenize(c.text),
        ...tokenize(c.topic),
      ];
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      this.termFreq.push(tf);
      this.docLens.push(tokens.length);
      totalLen += tokens.length;
      for (const term of tf.keys()) {
        this.docFreq.set(term, (this.docFreq.get(term) ?? 0) + 1);
      }
    }
    this.avgDocLen = totalLen / Math.max(1, this.chunks.length);
    this.seeded = true;
  }

  private bm25(queryTokens: string[], docIdx: number): number {
    const k1 = 1.5;
    const b = 0.75;
    const N = this.chunks.length;
    const tf = this.termFreq[docIdx];
    const dl = this.docLens[docIdx];
    let score = 0;
    for (const q of queryTokens) {
      const f = tf.get(q) ?? 0;
      if (f === 0) continue;
      const df = this.docFreq.get(q) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const norm = f * (k1 + 1);
      const denom = f + k1 * (1 - b + (b * dl) / this.avgDocLen);
      score += idf * (norm / denom);
    }
    return score;
  }

  async search(query: string, k: number): Promise<RetrievedChunk[]> {
    await this.ready();
    const qvec = await embed(query);
    const qTokens = tokenize(query);

    // Vector sim (hashed when no OpenAI, real otherwise)
    const vecScores = this.chunks.map((c) => cosineSim(qvec, c.embedding ?? []));
    // BM25 lexical
    const lexScores = this.chunks.map((_, i) => this.bm25(qTokens, i));

    // Normalize so both signals live in [0, 1] before blending.
    const vmax = Math.max(0.0001, ...vecScores);
    const lmax = Math.max(0.0001, ...lexScores);

    // Hybrid: lexical dominates when no real embeddings, otherwise favor vectors.
    const w = isRealEmbeddings() ? { v: 0.7, l: 0.3 } : { v: 0.35, l: 0.65 };

    const scored = this.chunks.map((c, i) => ({
      ...c,
      score: w.v * (vecScores[i] / vmax) + w.l * (lexScores[i] / lmax),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}

/* -------------------------- Qdrant implementation ------------------------- */

class QdrantStore implements VectorStore {
  name = "qdrant";
  private url: string;
  private apiKey: string;
  private collection: string;
  private seeded = false;

  constructor() {
    this.url = process.env.QDRANT_URL!.replace(/\/$/, "");
    this.apiKey = process.env.QDRANT_API_KEY!;
    this.collection = process.env.QDRANT_COLLECTION ?? "gym_ai_coach";
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      "api-key": this.apiKey,
    };
  }

  private async ensureCollection(dim: number) {
    // HEAD check
    const probe = await fetch(
      `${this.url}/collections/${this.collection}`,
      { headers: this.headers() }
    );
    if (probe.ok) return;

    await fetch(`${this.url}/collections/${this.collection}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify({
        vectors: { size: dim, distance: "Cosine" },
      }),
    });
  }

  async ready() {
    if (this.seeded) return;

    const seedEmbed = await embed(KNOWLEDGE_CHUNKS[0].text);
    await this.ensureCollection(seedEmbed.length);

    const points = [{ id: 1, vector: seedEmbed, payload: KNOWLEDGE_CHUNKS[0] }];
    for (let i = 1; i < KNOWLEDGE_CHUNKS.length; i++) {
      const v = await embed(KNOWLEDGE_CHUNKS[i].text);
      points.push({ id: i + 1, vector: v, payload: KNOWLEDGE_CHUNKS[i] });
    }

    await fetch(
      `${this.url}/collections/${this.collection}/points?wait=true`,
      {
        method: "PUT",
        headers: this.headers(),
        body: JSON.stringify({ points }),
      }
    );
    this.seeded = true;
  }

  async search(query: string, k: number): Promise<RetrievedChunk[]> {
    await this.ready();
    const vec = await embed(query);
    const res = await fetch(
      `${this.url}/collections/${this.collection}/points/search`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ vector: vec, limit: k, with_payload: true }),
      }
    );
    if (!res.ok) throw new Error(`Qdrant search failed: ${res.status}`);
    const data = (await res.json()) as {
      result: Array<{ score: number; payload: KnowledgeChunk }>;
    };
    return data.result.map((r) => ({ ...r.payload, score: r.score }));
  }
}

/* ----------------------- Supabase pgvector implementation ---------------- */

/**
 * Uses Supabase Postgres + the `pgvector` extension to store and search the
 * knowledge chunks. Calls a `match_kb_chunks(query_embedding, match_count)`
 * SQL function via PostgREST and upserts chunks into a `kb_chunks` table.
 *
 * Expected schema (run once in Supabase SQL editor):
 *
 *   create extension if not exists vector;
 *   create table kb_chunks (
 *     id text primary key, topic text, title text, content text,
 *     embedding vector(768)
 *   );
 *   create index on kb_chunks using hnsw (embedding vector_cosine_ops);
 *   create or replace function match_kb_chunks(
 *     query_embedding vector(768), match_count int default 4
 *   ) returns table (id text, topic text, title text, content text, score float)
 *   language sql stable as $$
 *     select id, topic, title, content,
 *            1 - (embedding <=> query_embedding) as score
 *       from kb_chunks where embedding is not null
 *       order by embedding <=> query_embedding limit match_count;
 *   $$;
 */
class SupabaseVectorStore implements VectorStore {
  name = "supabase-pgvector";
  private url: string;
  private key: string;
  private seeded = false;
  private seedingPromise: Promise<void> | null = null;

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

  async ready(): Promise<void> {
    if (this.seeded) return;
    if (this.seedingPromise) return this.seedingPromise;
    this.seedingPromise = this.seed();
    return this.seedingPromise;
  }

  private async seed(): Promise<void> {
    // Cheap probe: count rows already in the table. Skip seeding if populated.
    const head = await fetch(
      `${this.url}/rest/v1/kb_chunks?select=id`,
      { headers: this.headers({ Prefer: "count=exact" }) }
    );
    if (head.ok) {
      const range = head.headers.get("content-range") ?? "0-0/0";
      const total = Number(range.split("/")[1] ?? 0);
      if (total >= KNOWLEDGE_CHUNKS.length) {
        this.seeded = true;
        return;
      }
    }

    // Embed all chunks with the active provider, then upsert in one batch.
    const dim = await getEmbedDim();
    const rows: Array<{
      id: string;
      topic: string;
      title: string;
      content: string;
      embedding: number[];
    }> = [];
    for (const c of KNOWLEDGE_CHUNKS) {
      const v = await embed(c.text);
      if (v.length !== dim) {
        throw new Error(
          `Embed dim mismatch: provider returned ${v.length}, expected ${dim}.`
        );
      }
      rows.push({
        id: c.id,
        topic: c.topic,
        title: c.title,
        content: c.text,
        embedding: v,
      });
    }

    const res = await fetch(`${this.url}/rest/v1/kb_chunks`, {
      method: "POST",
      headers: this.headers({
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Supabase chunk seed failed: ${res.status} ${body.slice(0, 200)}`
      );
    }
    this.seeded = true;
  }

  async search(query: string, k: number): Promise<RetrievedChunk[]> {
    await this.ready();
    const vec = await embed(query);

    const res = await fetch(`${this.url}/rest/v1/rpc/match_kb_chunks`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ query_embedding: vec, match_count: k }),
    });
    if (!res.ok) {
      throw new Error(`Supabase RPC match_kb_chunks failed: ${res.status}`);
    }
    const rows = (await res.json()) as Array<{
      id: string;
      topic: string;
      title: string;
      content: string;
      score: number;
    }>;
    return rows.map((r) => ({
      id: r.id,
      topic: r.topic,
      title: r.title,
      text: r.content,
      score: r.score,
    }));
  }
}

/* --------------------------------- Factory -------------------------------- */

let singleton: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (singleton) return singleton;
  if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
    singleton = new QdrantStore();
  } else if (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_KEY &&
    process.env.VECTOR_STORE !== "memory"
  ) {
    singleton = new SupabaseVectorStore();
  } else {
    singleton = new InMemoryStore();
  }
  return singleton;
}

export function isRealVectorStore(): boolean {
  return (
    Boolean(process.env.QDRANT_URL && process.env.QDRANT_API_KEY) ||
    (Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) &&
      process.env.VECTOR_STORE !== "memory")
  );
}

/** Used by /api/profile to label the wired stack. */
export function vectorStoreLabel(): string {
  if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
    return "Qdrant (cloud)";
  }
  if (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_KEY &&
    process.env.VECTOR_STORE !== "memory"
  ) {
    return "Supabase (pgvector)";
  }
  return "In-memory hybrid (cosine + BM25)";
}
