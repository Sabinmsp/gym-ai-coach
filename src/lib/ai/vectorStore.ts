import type { KnowledgeChunk, RetrievedChunk } from "./types";
import { KNOWLEDGE_CHUNKS } from "./knowledgeBase";
import {
  embed,
  embedFallback,
  cosineSim,
  isRealEmbeddings,
  tokenize,
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

    // Pre-embed all chunks once per process.
    if (isRealEmbeddings()) {
      for (const c of KNOWLEDGE_CHUNKS) {
        this.chunks.push({ ...c, embedding: await embed(c.text) });
      }
    } else {
      for (const c of KNOWLEDGE_CHUNKS) {
        this.chunks.push({ ...c, embedding: embedFallback(c.text) });
      }
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

/* --------------------------------- Factory -------------------------------- */

let singleton: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (singleton) return singleton;
  if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
    singleton = new QdrantStore();
  } else {
    singleton = new InMemoryStore();
  }
  return singleton;
}

export function isRealVectorStore(): boolean {
  return Boolean(process.env.QDRANT_URL && process.env.QDRANT_API_KEY);
}
