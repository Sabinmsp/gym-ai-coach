export const user = {
  name: "Alex",
  age: 27,
  weightKg: 78,
  heightCm: 181,
  goal: "Lean muscle gain",
  diet: "High-protein · Low sugar",
  trainingDays: ["Mon", "Tue", "Thu", "Fri", "Sat"],
  injuries: "Mild left shoulder impingement — avoid heavy overhead press.",
  streakDays: 12,
  avatarInitials: "AR",
};

export const dailySummary = {
  caloriesTarget: 2480,
  caloriesEaten: 1420,
  proteinTarget: 180,
  proteinEaten: 122,
  waterTargetL: 3,
  waterDrunkL: 1.8,
  steps: 6420,
  stepsTarget: 10000,
  activeMinutes: 42,
};

export const quickActions = [
  { id: "workout", label: "Workout", sub: "Push · 52 min", icon: "Dumbbell" },
  { id: "nutrition", label: "Nutrition", sub: "1,420 / 2,480 kcal", icon: "Apple" },
  { id: "progress", label: "Progress", sub: "+1.2 kg this month", icon: "LineChart" },
  { id: "ai", label: "Ask AI", sub: "Your coach is online", icon: "Sparkles" },
] as const;

export const chatMessages = [
  {
    id: "m1",
    role: "ai" as const,
    text: "Morning, Alex. Ready for today? I noticed you hit your protein goal 4 days in a row — nice work.",
    time: "8:02 AM",
  },
  {
    id: "m2",
    role: "user" as const,
    text: "My left shoulder is a bit sore. Can we swap overhead press today?",
    time: "8:04 AM",
  },
  {
    id: "m3",
    role: "ai" as const,
    text:
      "Absolutely. Let's swap overhead press for neutral-grip dumbbell press — lighter on the joint. I'll also add band pull-aparts to warm up the rotator cuff.",
    time: "8:04 AM",
  },
  {
    id: "m4",
    role: "user" as const,
    text: "Perfect. What about post-workout meal?",
    time: "8:05 AM",
  },
  {
    id: "m5",
    role: "ai" as const,
    text:
      "Aim for ~40g protein + 60g carbs. A chicken rice bowl with avocado hits the mark and keeps sodium in check.",
    time: "8:05 AM",
  },
] as const;

export const weeklyWorkouts = [
  { day: "Mon", done: true, label: "Push" },
  { day: "Tue", done: true, label: "Pull" },
  { day: "Wed", done: false, label: "Rest" },
  { day: "Thu", done: true, label: "Legs" },
  { day: "Fri", done: true, label: "Upper" },
  { day: "Sat", done: false, label: "Cardio" },
  { day: "Sun", done: false, label: "Rest" },
];

export const weightHistory = [
  { w: 0, kg: 80.2 },
  { w: 1, kg: 79.8 },
  { w: 2, kg: 79.1 },
  { w: 3, kg: 78.6 },
  { w: 4, kg: 78.2 },
  { w: 5, kg: 77.9 },
  { w: 6, kg: 78.0 },
];
