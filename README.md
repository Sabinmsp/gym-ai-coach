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

## Customizing

- Brand color is defined in `tailwind.config.ts` under `colors.brand`.
- Dummy data lives in `src/lib/data.ts` — swap with real API calls later.
- Every screen is a standalone component and can be dropped into a different shell.

## Screenshots

Open the page on a desktop browser for the full iPhone-in-frame look; it still works on mobile (the frame just fills the viewport).
