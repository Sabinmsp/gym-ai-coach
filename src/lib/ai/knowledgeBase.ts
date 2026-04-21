import type { KnowledgeChunk } from "./types";

/**
 * Curated fitness knowledge chunks. In production these would be ingested
 * from PDFs / trusted sources. Kept short and citation-friendly.
 */
export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: "kb-protein-1",
    topic: "nutrition",
    title: "Daily protein intake for muscle gain",
    text: "For hypertrophy (muscle gain) in resistance-trained individuals, 1.6–2.2 g of protein per kg of bodyweight per day is well supported by meta-analyses (Morton et al., 2018). Spread intake across 3–5 meals of 0.3–0.4 g/kg each for maximal muscle protein synthesis. Above ~2.2 g/kg additional benefits are minimal.",
  },
  {
    id: "kb-protein-2",
    topic: "nutrition",
    title: "Protein timing around workouts",
    text: "The anabolic window is wider than once thought. What matters most is total daily protein intake. That said, 20–40 g of high-quality protein within 2 hours post-workout supports recovery, especially if the prior meal was >4 hours earlier.",
  },
  {
    id: "kb-calories-1",
    topic: "nutrition",
    title: "Caloric surplus for lean bulking",
    text: "For lean muscle gain aim for a small surplus of 200–400 kcal above maintenance. This usually produces ~0.25–0.5% bodyweight gain per week. Larger surpluses accelerate fat gain without meaningfully increasing muscle gain for natural lifters.",
  },
  {
    id: "kb-calories-2",
    topic: "nutrition",
    title: "Caloric deficit for fat loss",
    text: "A 300–500 kcal/day deficit preserves muscle while losing fat. Pair with 1.8–2.4 g/kg protein and 2–4 resistance training sessions per week. Aggressive deficits (>750 kcal) accelerate muscle loss and hormonal decline.",
  },
  {
    id: "kb-hypertrophy-1",
    topic: "training",
    title: "Volume for hypertrophy",
    text: "Most lifters grow best with 10–20 hard sets per muscle group per week spread over 2 sessions (Schoenfeld et al. 2017). Beginners can progress on 6–10 sets. Advanced lifters may need 15–25 sets. Always train within 0–3 reps of failure for most sets.",
  },
  {
    id: "kb-hypertrophy-2",
    topic: "training",
    title: "Rep ranges for hypertrophy",
    text: "Hypertrophy occurs across a wide rep range (5–30 reps) as long as sets are taken close to failure. For most lifters 6–12 reps offers the best balance of load and fatigue. Use 12–20 reps for isolation work to protect joints.",
  },
  {
    id: "kb-progression-1",
    topic: "training",
    title: "Progressive overload",
    text: "Progress is driven by increasing demand over time. Add reps first (e.g. 8 → 10 → 12), then add weight and reset reps. Aim for +2.5–5 kg on compound lifts every 2–4 weeks as a beginner, slower as an intermediate.",
  },
  {
    id: "kb-shoulder-injury-1",
    topic: "injury",
    title: "Shoulder impingement substitutions",
    text: "For mild shoulder impingement avoid heavy barbell overhead press, wide-grip bench, upright rows, and behind-the-neck pull-downs. Swap to neutral-grip dumbbell press, landmine press, push-ups, face pulls, and band pull-aparts. Warm up rotator cuff for 5 min before pressing.",
  },
  {
    id: "kb-lower-back-1",
    topic: "injury",
    title: "Lower back care",
    text: "If lower back is sore, reduce axial loading for a week. Swap barbell squats for leg press or Bulgarian split squats, and barbell rows for chest-supported rows. Add 10 min of hip mobility and dead bug variations daily.",
  },
  {
    id: "kb-recovery-1",
    topic: "recovery",
    title: "Sleep and muscle growth",
    text: "Sleeping under 6 hours per night reduces protein synthesis by up to 18% and elevates cortisol. Target 7–9 hours. A consistent sleep schedule matters more than total hours for recovery.",
  },
  {
    id: "kb-recovery-2",
    topic: "recovery",
    title: "Deload weeks",
    text: "Every 4–8 weeks reduce training volume by ~50% for one week (a 'deload'). This allows connective tissue and CNS to recover and usually precedes a performance breakthrough.",
  },
  {
    id: "kb-cardio-1",
    topic: "training",
    title: "Cardio for lifters",
    text: "Zone 2 cardio (60–70% max HR) 2–3x per week for 30–45 min improves recovery between sets, raises work capacity, and does not impair hypertrophy. Sprinkle HIIT only if time-constrained.",
  },
  {
    id: "kb-hydration-1",
    topic: "nutrition",
    title: "Hydration targets",
    text: "Aim for ~35 ml water per kg of bodyweight plus 0.5–1 L per hour of training. Under-hydration reduces strength output by 3–5% per 2% bodyweight lost.",
  },
  {
    id: "kb-creatine-1",
    topic: "supplements",
    title: "Creatine monohydrate",
    text: "Creatine monohydrate (3–5 g/day) is the most studied supplement in sports science. It improves strength, work capacity, and lean mass by 1–2 kg over 8 weeks. No loading phase required; saturation occurs in ~3 weeks.",
  },
  {
    id: "kb-warmup-1",
    topic: "training",
    title: "Pre-workout warm up",
    text: "Spend 8–12 min on: (1) 3–5 min easy cardio to raise core temp, (2) mobility drills for the joints you're training, (3) 2–3 ramp-up sets at 40/60/80% of working weight.",
  },
  {
    id: "kb-beginner-plan-1",
    topic: "training",
    title: "Beginner 3-day full body",
    text: "A simple beginner plan: 3 full-body days per week, each hitting squat, hinge, push, pull, core. 3 sets × 5–10 reps on compounds, 2 sets × 10–15 on isolations. Progress weight each session while form holds.",
  },
  {
    id: "kb-push-pull-legs-1",
    topic: "training",
    title: "Push/Pull/Legs split",
    text: "PPL is ideal for intermediates training 5–6x per week. Push: chest, shoulders, triceps. Pull: back, biceps, rear delts. Legs: quads, hamstrings, glutes, calves. 12–18 working sets per session.",
  },
  {
    id: "kb-calves-1",
    topic: "training",
    title: "Stubborn calves",
    text: "Calves respond to high frequency and a full stretch. Train them 3–4x per week with 8–15 reps including a 2-second pause at the bottom. Standing calf raises emphasize gastrocnemius, seated emphasize soleus.",
  },
  {
    id: "kb-abs-1",
    topic: "training",
    title: "Visible abs",
    text: "Abs are revealed through low body fat (~12–15% for men, 18–22% for women), not endless crunches. Include direct ab work 2–3x per week (hanging leg raises, cable crunches, dead bugs) and control calories.",
  },
  {
    id: "kb-plateau-1",
    topic: "training",
    title: "Breaking a plateau",
    text: "If a lift stalls for 3+ weeks: (1) check sleep and protein, (2) reduce volume by 30% for a week, (3) switch to a variation (e.g. paused bench, front squat) for 4 weeks, (4) then return to the main lift.",
  },
];
