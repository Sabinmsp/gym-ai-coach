import { NextRequest } from "next/server";
import { DEMO_USER_ID, getProfileStore } from "@/lib/ai/profileStore";
import { getVectorStore } from "@/lib/ai/vectorStore";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { streamAnswer, type ChatTurn } from "@/lib/ai/llm";
import { rateLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";

interface ChatBody {
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  userId?: string;
}

export async function POST(req: NextRequest) {
  let body: ChatBody = {};
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return jsonError(400, "Missing 'messages'");
  }

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content?.trim()) {
    return jsonError(400, "Last message must be a non-empty user turn");
  }
  if (last.content.length > 2000) {
    return jsonError(400, "Message too long (max 2000 chars)");
  }

  const clientKey =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";

  const rl = rateLimit(`chat:${clientKey}`, 30, 60_000);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests", retryAfterMs: rl.resetMs }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const userId = body.userId ?? DEMO_USER_ID;
  const profileStore = getProfileStore();
  const profile = await profileStore.get(userId);
  if (!profile) {
    return jsonError(404, "No profile found for user");
  }

  const question = last.content.trim();
  const history: ChatTurn[] = messages
    .slice(0, -1)
    // Keep the last 10 turns so the model has recent context without bloat.
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();

  // Short-circuit greetings / small talk. Avoids RAG + LLM entirely so tiny
  // local models can't drift into hallucinated follow-up questions.
  const canned = cannedReply(question, profile.name);
  if (canned) {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(canned));
        controller.close();
      },
    });
    console.log(`[chat] canned · "${question.slice(0, 40)}"`);
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const vector = getVectorStore();
  let raw: Awaited<ReturnType<typeof vector.search>> = [];
  try {
    raw = await vector.search(question, 4);
  } catch (err) {
    // Misconfigured vector store (bad key, dim mismatch, network). Fall
    // through to the empty-chunks refusal path rather than 500-ing the
    // request — the user sees a clean "no info" reply instead of an error.
    console.error("[chat] retrieval failed:", err);
  }
  // Drop chunks below a minimum relevance threshold so we don't pollute the
  // prompt with unrelated topics (which small models then latch onto).
  const MIN_SCORE = 0.25;
  const chunks = raw.filter((c) => (c.score ?? 0) >= MIN_SCORE);

  // Hard refusal path: if retrieval came back empty after filtering, we
  // short-circuit the LLM. Small local models otherwise invent facts to fill
  // the silence ("a liter of water contains 91g of carbs", etc).
  if (chunks.length === 0) {
    const refusal =
      "I don't have verified info on that yet — I won't guess. Try asking about training, nutrition, recovery, injuries, cardio, or supplements.";
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(refusal));
        controller.close();
      },
    });
    console.log(
      `[chat] refused · "${question.slice(0, 40)}" · 0/${raw.length} chunks (top score ${
        raw[0]?.score?.toFixed(3) ?? "n/a"
      })`
    );
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const systemPrompt = buildSystemPrompt(profile);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const started = Date.now();
      let tokens = 0;
      try {
        const gen = streamAnswer({
          systemPrompt,
          userQuestion: question,
          profile,
          chunks,
          history,
        });
        while (true) {
          const { value, done } = await gen.next();
          if (done) {
            const info = value;
            console.log(
              `[chat] ${Date.now() - started}ms · ${tokens} tokens · ${
                info?.usedProvider ?? "unknown"
              } (${info?.model ?? "n/a"}) · ${chunks.length}/${raw.length} chunks`
            );
            break;
          }
          tokens++;
          controller.enqueue(encoder.encode(value));
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        controller.enqueue(
          encoder.encode("\n\n[connection interrupted — try again]")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Detects short greetings / thanks / chit-chat and returns a deterministic
 * reply. These messages carry no training question, so routing them through
 * RAG + a small local LLM only invites hallucinations.
 */
function cannedReply(text: string, name: string): string | null {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .trim();
  if (!normalized) return null;

  const firstName = name.split(" ")[0] ?? "there";

  const greetings = new Set([
    "hi",
    "hey",
    "hello",
    "yo",
    "sup",
    "hiya",
    "howdy",
    "hola",
    "gm",
    "good morning",
    "good afternoon",
    "good evening",
    "hi there",
    "hey there",
    "hello there",
    "hey coach",
    "hi coach",
  ]);
  if (greetings.has(normalized)) {
    return `Hey ${firstName} — what can I help you with today? Ask me about training, nutrition, or recovery.`;
  }

  const thanks = new Set([
    "thanks",
    "thank you",
    "thx",
    "ty",
    "cheers",
    "appreciate it",
    "thanks coach",
  ]);
  if (thanks.has(normalized)) {
    return `Anytime. Ping me when you're ready for the next one.`;
  }

  const acks = new Set([
    "ok",
    "okay",
    "k",
    "kk",
    "cool",
    "nice",
    "got it",
    "great",
    "sounds good",
    "bet",
  ]);
  if (acks.has(normalized)) {
    return `Got it. What else do you want to work on?`;
  }

  const byes = new Set(["bye", "goodbye", "cya", "see ya", "see you", "later"]);
  if (byes.has(normalized)) {
    return `Talk soon, ${firstName}. Keep the reps clean.`;
  }

  // Very short inputs with no fitness-relevant tokens likely aren't real
  // questions either — but we only auto-reply for the explicit sets above to
  // avoid swallowing legitimate short questions like "protein?".
  return null;
}
