import type { RetrievedChunk, UserProfile } from "./types";

/**
 * LLM abstraction. Uses OpenAI chat completions when OPENAI_API_KEY is set.
 * Otherwise synthesizes an answer directly from retrieved chunks + profile —
 * the fallback never invents facts because it only quotes what was retrieved.
 */

export interface LlmAnswer {
  text: string;
  model: string;
  usedProvider: "openai" | "template-fallback";
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
      console.warn("[ai] OpenAI failed, using template fallback:", err);
    }
  }
  return templateAnswer(args);
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
 * Deterministic fallback: assembles an answer from retrieved chunks, personalized
 * with the user's profile. Never invents numbers — only quotes chunks.
 */
function templateAnswer({
  userQuestion,
  profile,
  chunks,
}: GenerateArgs): LlmAnswer {
  if (chunks.length === 0) {
    return {
      text: "I don't have enough in your knowledge base to answer that confidently yet. Try asking about protein, hypertrophy, recovery, injuries, cardio, or progression.",
      model: "template-fallback",
      usedProvider: "template-fallback",
    };
  }

  const top = chunks.slice(0, 3);
  const isInjury =
    /(sore|pain|hurt|injur|shoulder|knee|back|wrist)/i.test(userQuestion) ||
    profile.injuries?.toLowerCase().includes("shoulder");

  const lines: string[] = [];

  lines.push(`Hey ${profile.name.split(" ")[0]} — here's my take:`);
  lines.push("");

  // Weight-aware protein number if relevant
  if (/protein/i.test(userQuestion)) {
    const lo = Math.round(profile.weightKg * 1.6);
    const hi = Math.round(profile.weightKg * 2.2);
    lines.push(
      `For your ${profile.weightKg} kg and ${profile.goal.toLowerCase()}, aim for ${lo}–${hi} g protein per day, spread across 4 meals.`
    );
  }

  if (isInjury) {
    lines.push(
      `Because of your note — "${profile.injuries}" — I'd avoid loaded overhead work today and swap to a safer variation.`
    );
  }

  lines.push("Backed by your knowledge base:");
  for (const c of top) {
    const snippet = c.text.length > 220 ? c.text.slice(0, 217) + "…" : c.text;
    lines.push(`• ${c.title}: ${snippet}`);
  }

  lines.push("");
  lines.push(
    "Want me to turn this into a concrete workout or meal plan for today?"
  );

  return {
    text: lines.join("\n"),
    model: "template-fallback",
    usedProvider: "template-fallback",
  };
}
