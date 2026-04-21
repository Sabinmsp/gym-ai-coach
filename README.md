# Gym AI Coach — iPhone-style UI mockup

A polished, portfolio-ready mobile UI mockup built with **Next.js 15 + TypeScript + Tailwind CSS**. The whole app is rendered inside a realistic iPhone-style frame at the center of the page, so it looks like a real iOS app demo.

> Frontend only — no backend, no auth. All data is dummy.

## Features

- Realistic iPhone frame (bezel, Dynamic Island, side buttons, home indicator)
- Dark premium theme with glow/glass effects and subtle motion
- Five screens: **Welcome · Home · Ask AI · Progress · Profile**
- Bottom tab bar navigation
- Animated chat with typing indicator on "Ask AI"
- SVG weight chart and protein trend bars on "Progress"
- Clean, reusable components — easy to extend

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    layout.tsx
    page.tsx              # composes phone frame + screens
    globals.css
  components/
    phone/
      PhoneFrame.tsx      # iPhone bezel, notch, status bar
    layout/
      ScreenShell.tsx     # common scrollable screen container
      TabBar.tsx          # bottom tab bar
    screens/
      WelcomeScreen.tsx
      HomeScreen.tsx
      AskAiScreen.tsx
      ProgressScreen.tsx
      ProfileScreen.tsx
    ui/
      Button.tsx
      Card.tsx
      ProgressBar.tsx
      ProgressRing.tsx
  lib/
    cn.ts                 # classnames helper
    data.ts               # dummy data
```

## AI engineering (Ask AI screen)

The Ask AI tab is backed by a real **RAG pipeline** and the engineering is visible inside the iPhone (a collapsible debug panel shows the stages, retrieved chunks, latency, cache hit, rate-limit status, and system prompt).

### Pipeline (per request to `POST /api/ask`)

1. **Rate limit** — 15 req/min per IP (fixed-window token bucket)
2. **Load profile** — `profileStore.get(userId)` → Supabase (if configured) or in-memory
3. **Cache check** — normalized-question + profile-hash LRU, 30 min TTL
4. **Retrieve** — top-k (default 4) chunks from a vector store by cosine similarity
5. **Strict prompt** — system prompt forbids invention ("I don't have verified info on that yet" if unsupported)
6. **Generate** — OpenAI `gpt-4o-mini` (if `OPENAI_API_KEY` is set) or a template fallback that only quotes retrieved chunks
7. **Cache put + log timings** — every stage emits a `{name, durationMs, status}` step

### Swap in real services

Works out of the box with **zero env vars** (in-memory profile, in-memory vectors, hashed embeddings, template LLM). To go live, copy `.env.example` → `.env.local` and set any subset of:

| Env var | What it enables |
| --- | --- |
| `OPENAI_API_KEY` | Real OpenAI embeddings + chat completions |
| `QDRANT_URL` + `QDRANT_API_KEY` | Qdrant vector DB (collection auto-created) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Supabase profile persistence |

The factory pattern in `src/lib/ai/{vectorStore,profileStore}.ts` picks the real implementation automatically at module load.

### Files

```
src/
  lib/ai/
    types.ts           # shared interfaces
    knowledgeBase.ts   # 20 curated fitness chunks (the RAG corpus)
    embeddings.ts      # OpenAI + hashed fallback, L2-normalized
    vectorStore.ts     # in-memory cosine ↔ Qdrant REST
    profileStore.ts    # in-memory ↔ Supabase PostgREST
    llm.ts             # OpenAI chat ↔ template fallback
    prompt.ts          # strict "do not hallucinate" system prompt
    cache.ts           # LRU + TTL + cache key hash
    rateLimit.ts       # fixed-window limiter
    logger.ts          # per-request stage timings → stdout + UI
    rag.ts             # orchestrator used by /api/ask
  app/api/
    ask/route.ts       # POST  { question } → { answer, debug }
    profile/route.ts   # GET / PUT user profile
  components/ai/
    DebugPanel.tsx     # visualizes the pipeline on each AI reply
    ProfileForm.tsx    # edit & persist profile, shows wired AI stack
```

## Customizing

- Brand color is defined in `tailwind.config.ts` under `colors.brand`.
- Static dummy UI data lives in `src/lib/data.ts`.
- Every screen is a standalone component and can be dropped into a different shell.

## Screenshots

Open the page on a desktop browser for the full iPhone-in-frame look; it still works on mobile (the frame just fills the viewport).
