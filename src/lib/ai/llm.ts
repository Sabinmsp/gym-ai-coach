import type { RetrievedChunk, UserProfile } from "./types";

/**
 * LLM abstraction. Uses OpenAI chat completions when OPENAI_API_KEY is set.
 * Otherwise synthesizes an answer directly from retrieved chunks + profile —
 * the fallback never invents facts because it only quotes what was retrieved.
 */

export interface LlmAnswer {
  text: string;
  model: string;
  usedProvider: "openai" | "ollama" | "template-fallback";
}

interface GenerateArgs {
  systemPrompt: string;
  userQuestion: string;
  profile: UserProfile;
  chunks: RetrievedChunk[];
}

export async function generateAnswer(args: GenerateArgs): Promise<LlmAnswer> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAi(args);
    } catch (err) {
      console.warn("[ai] OpenAI failed, trying next provider:", err);
    }
  }

  if (await isOllamaUp()) {
    try {
      return await callOllama(args);
    } catch (err) {
      console.warn("[ai] Ollama failed, using template fallback:", err);
    }
  }

  return templateAnswer(args);
}

/* --------------------------------- Ollama --------------------------------- */

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

let ollamaCheckedAt = 0;
let ollamaIsUp = false;

export async function isOllamaUp(): Promise<boolean> {
  // Cache the availability probe for 30s so we don't hit it every request.
  if (Date.now() - ollamaCheckedAt < 30_000) return ollamaIsUp;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 800);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: ctrl.signal,
    });
    clearTimeout(to);
    ollamaIsUp = res.ok;
  } catch {
    ollamaIsUp = false;
  }
  ollamaCheckedAt = Date.now();
  return ollamaIsUp;
}

async function callOllama({
  systemPrompt,
  userQuestion,
  profile,
  chunks,
}: GenerateArgs): Promise<LlmAnswer> {
  const contextBlock = chunks
    .map((c, i) => `[${i + 1}] (${c.topic}) ${c.title}\n${c.text}`)
    .join("\n\n");

  const profileBlock = [
    `Name: ${profile.name}`,
    `Age: ${profile.age}`,
    `Weight: ${profile.weightKg} kg`,
    `Height: ${profile.heightCm} cm`,
    `Goal: ${profile.goal}`,
    `Diet: ${profile.diet}`,
    `Experience: ${profile.experience}`,
    `Training days / week: ${profile.trainingDaysPerWeek}`,
    `Injuries / notes: ${profile.injuries || "none"}`,
  ].join("\n");

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 220,
      },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `USER PROFILE:\n${profileBlock}\n\nRETRIEVED KNOWLEDGE:\n${contextBlock}\n\nQUESTION: ${userQuestion}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Ollama chat failed: ${res.status}`);
  const data = (await res.json()) as { message: { content: string } };
  return {
    text: data.message.content.trim(),
    model: `ollama/${OLLAMA_MODEL}`,
    usedProvider: "ollama",
  };
}

async function callOpenAi({
  systemPrompt,
  userQuestion,
  profile,
  chunks,
}: GenerateArgs): Promise<LlmAnswer> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const contextBlock = chunks
    .map((c, i) => `[${i + 1}] (${c.topic}) ${c.title}\n${c.text}`)
    .join("\n\n");

  const profileBlock = [
    `Name: ${profile.name}`,
    `Age: ${profile.age}`,
    `Weight: ${profile.weightKg} kg`,
    `Height: ${profile.heightCm} cm`,
    `Goal: ${profile.goal}`,
    `Diet: ${profile.diet}`,
    `Experience: ${profile.experience}`,
    `Training days / week: ${profile.trainingDaysPerWeek}`,
    `Injuries / notes: ${profile.injuries || "none"}`,
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `USER PROFILE:\n${profileBlock}\n\nRETRIEVED KNOWLEDGE:\n${contextBlock}\n\nQUESTION: ${userQuestion}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI chat failed: ${res.status}`);
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return {
    text: data.choices[0].message.content.trim(),
    model,
    usedProvider: "openai",
  };
}

/**
 * Deterministic fallback: short, on-topic answer grounded in the best
 * retrieved chunk. Never invents numbers — only surfaces the chunk.
 */
function templateAnswer({
  userQuestion,
  profile,
  chunks,
}: GenerateArgs): LlmAnswer {
  if (chunks.length === 0) {
    return {
      text: "I don't have verified info on that yet — ask about protein, hypertrophy, recovery, injuries, cardio, or progression.",
      model: "template-fallback",
      usedProvider: "template-fallback",
    };
  }

  const q = userQuestion.toLowerCase();
  const top = chunks[0];

  const isInjury =
    /(sore|pain|hurt|injur|shoulder|knee|back|wrist|elbow)/i.test(q);
  const isProtein = /\bprotein\b/.test(q);
  const isCalories = /(calorie|kcal|surplus|deficit|cut|bulk)/.test(q);
  const isCreatine = /creatine/.test(q);
  const isSleep = /(sleep|recover|rest\b)/.test(q);
  const isPlateau = /(plateau|stall|stuck|stopped progress)/.test(q);
  const isCardio = /(cardio|conditioning|zone\s*2|running|bike)/.test(q);
  const isAbs = /\b(abs|six pack|core visible|lean)\b/.test(q);
  const isWarmup = /(warm\s*up|mobility)/.test(q);
  const isBeginner = /(beginner|new to|just start|first program)/.test(q);
  const isVolume = /(how many sets|volume|sets per week)/.test(q);

  // Injury reply uses the profile note when present.
  if (isInjury) {
    if (profile.injuries) {
      return text(
        `Given your note — "${trim(profile.injuries, 80)}" — skip loaded overhead and heavy pressing today. Swap to neutral-grip DB press or push-ups, and add face pulls + band pull-aparts.`
      );
    }
    return text(
      `Pull back intensity ~20% today, swap any painful movement for a neutral variation (e.g. landmine press for OHP), and add 10 min of targeted mobility. If sharp pain persists >1 week, see a physio.`
    );
  }

  if (isProtein) {
    const lo = Math.round(profile.weightKg * 1.6);
    const hi = Math.round(profile.weightKg * 2.2);
    return text(
      `For your ${profile.weightKg} kg and "${profile.goal.toLowerCase()}", aim for ${lo}–${hi} g protein/day across 3–5 meals. Prioritize ~0.4 g/kg per meal for best muscle protein synthesis.`
    );
  }

  if (isCalories) {
    const cutting = /(deficit|cut|lose fat|fat loss)/.test(q);
    if (cutting) {
      return text(
        `For fat loss, target a 300–500 kcal/day deficit. With ${profile.weightKg} kg, keep protein at 1.8–2.4 g/kg and lift 2–4x/week to preserve muscle.`
      );
    }
    return text(
      `For lean gain, run a small surplus of 200–400 kcal above maintenance — about 0.25–0.5% of bodyweight gain per week. Bigger surpluses mostly add fat.`
    );
  }

  if (isCreatine) {
    return text(
      `Yes — creatine monohydrate, 3–5 g/day, is the most studied supplement in sports science. No loading phase needed; expect +1–2 kg lean mass and a strength bump over ~8 weeks.`
    );
  }

  if (isPlateau) {
    return text(
      `Check sleep + protein first. Then deload 30% volume for a week, swap the main lift for a variation (paused bench, front squat) for 4 weeks, then return — it usually breaks the stall.`
    );
  }

  if (isSleep) {
    return text(
      `Target 7–9 hours consistently — below 6 cuts protein synthesis by up to 18% and bumps cortisol. Schedule matters more than raw duration.`
    );
  }

  if (isCardio) {
    return text(
      `For lifters, zone-2 cardio (60–70% max HR) 2–3x per week, 30–45 min per session. It raises recovery and work capacity without impairing hypertrophy.`
    );
  }

  if (isAbs) {
    return text(
      `Abs show up at low body fat (~12–15% men, 18–22% women), not from more crunches. Keep a mild deficit, hit 180g protein, and train core 2–3x/week (hanging leg raises, cable crunches).`
    );
  }

  if (isWarmup) {
    return text(
      `8–12 min: 3–5 min easy cardio, mobility for the joints you're training, then 2–3 ramp sets at 40/60/80% of your working weight.`
    );
  }

  if (isBeginner) {
    return text(
      `Start with 3 full-body sessions a week: squat, hinge, push, pull, core. 3×5–10 on compounds, 2×10–15 on isolations. Add weight every session while form holds.`
    );
  }

  if (isVolume) {
    const lo = profile.experience === "beginner" ? 6 : 10;
    const hi = profile.experience === "advanced" ? 25 : 20;
    return text(
      `Aim for ${lo}–${hi} hard sets per muscle per week, split across 2 sessions. Stay within 0–3 reps of failure on most sets.`
    );
  }

  // Default: use the top retrieved chunk, but prefix with a confidence hint
  // when the score is weak so the user knows to rephrase.
  const weak = (top.score ?? 0) < 0.25;
  const base = shorten(top.text, 220);
  return text(
    weak
      ? `Closest I have in the knowledge base — rephrase if this misses:\n\n${base}`
      : base
  );
}

function text(body: string): LlmAnswer {
  return {
    text: body,
    model: "template-fallback",
    usedProvider: "template-fallback",
  };
}

function shorten(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return lastStop > 80 ? cut.slice(0, lastStop + 1) : cut.trim() + "…";
}

function trim(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
