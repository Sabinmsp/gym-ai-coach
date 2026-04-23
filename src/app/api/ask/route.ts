import { NextRequest, NextResponse } from "next/server";
import { ask } from "@/lib/ai/rag";
import { DEMO_USER_ID } from "@/lib/ai/profileStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { question?: string; userId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json(
      { error: "Missing 'question'" },
      { status: 400 }
    );
  }
  if (question.length > 1000) {
    return NextResponse.json(
      { error: "Question is too long (max 1000 chars)" },
      { status: 400 }
    );
  }

  const userId = body.userId ?? DEMO_USER_ID;
  const clientKey =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";

  const result = await ask({ userId, question, clientKey });
  const body =
    result.status === 200 && result.body && typeof result.body === "object"
      ? { answer: (result.body as { answer?: string }).answer ?? "" }
      : result.body;
  return NextResponse.json(body, {
    status: result.status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
