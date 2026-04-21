import type { KnowledgeChunk, RetrievedChunk } from "./types";
import { KNOWLEDGE_CHUNKS } from "./knowledgeBase";
import { embed, embedFallback, cosineSim, isRealEmbeddings } from "./embeddings";

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

  async ready() {
    if (this.seeded) return;

    // Pre-embed all chunks once per process.
    if (isRealEmbeddings()) {
      // Do this sequentially to be gentle on rate limits for the demo seed.
      for (const c of KNOWLEDGE_CHUNKS) {
        this.chunks.push({ ...c, embedding: await embed(c.text) });
      }
    } else {
      for (const c of KNOWLEDGE_CHUNKS) {
        this.chunks.push({ ...c, embedding: embedFallback(c.text) });
      }
    }
    this.seeded = true;
  }

  async search(query: string, k: number): Promise<RetrievedChunk[]> {
    await this.ready();
    const qvec = await embed(query);
    const scored = this.chunks.map((c) => ({
      ...c,
      score: cosineSim(qvec, c.embedding ?? []),
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
