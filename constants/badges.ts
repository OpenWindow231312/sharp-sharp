// Deprecated: badges merged into constants/levels.ts. Kept for reference
// only, not imported elsewhere.
import type { PatternVariant } from "@/components/ui/PatternFill";
import type { BadgeShape } from "@/components/ui/BadgeMedallion";

export type BadgeId =
  | "eish"
  | "ubuntu"
  | "lekker"
  | "ayoba"
  | "local_legend"
  | "sharp_sharp";

export type UserStats = {
  submittedCount: number;
  savedCount: number;
  xp: number;
};

export type Badge = {
  id: BadgeId;
  title: string;
  gloss: string;
  description: string;
  pattern: PatternVariant;
  shape: BadgeShape;
  isUnlocked: (stats: UserStats) => boolean;
  progress: (stats: UserStats) => number;
};

// Shape escalates with tier — circle (entry) -> hexagon -> shield ->
// burst (top badge) — so unlocking visually feels like climbing ranks,
// independent of the pattern-fill colour underneath.
export const BADGES: Badge[] = [
  {
    id: "eish",
    title: "Eish!",
    gloss: "a catch-all exclamation — surprise, frustration, sympathy",
    description: "Add your first word to Sharp Sharp",
    pattern: "diamond",
    shape: "circle",
    isUnlocked: (s) => s.submittedCount >= 1,
    progress: (s) => Math.min(s.submittedCount / 1, 1),
  },
  {
    id: "ubuntu",
    title: "Ubuntu",
    gloss: '"I am because we are" — community, shared humanity',
    description: "Add 10 words to Sharp Sharp",
    pattern: "diamond",
    shape: "hexagon",
    isUnlocked: (s) => s.submittedCount >= 10,
    progress: (s) => Math.min(s.submittedCount / 10, 1),
  },
  {
    id: "lekker",
    title: "Lekker",
    gloss: 'Afrikaans for "nice" or "great"',
    description: "Save your first word to your dictionary",
    pattern: "beadscatter",
    shape: "circle",
    isUnlocked: (s) => s.savedCount >= 1,
    progress: (s) => Math.min(s.savedCount / 1, 1),
  },
  {
    id: "ayoba",
    title: "Ayoba",
    gloss: "an exclamation of excitement or approval",
    description: "Save 20 words to your dictionary",
    pattern: "beadscatter",
    shape: "hexagon",
    isUnlocked: (s) => s.savedCount >= 20,
    progress: (s) => Math.min(s.savedCount / 20, 1),
  },
  {
    id: "local_legend",
    title: "Local Legend",
    gloss: "someone who really knows the local scene",
    description: "Reach the Local Legend level",
    pattern: "triangle",
    shape: "shield",
    isUnlocked: (s) => s.xp >= 150,
    progress: (s) => Math.min(s.xp / 150, 1),
  },
  {
    id: "sharp_sharp",
    title: "Sharp Sharp",
    gloss: '"all good" — also used as a greeting or goodbye',
    description: "Reach the top level — Sharp Sharp",
    pattern: "chevron",
    shape: "burst",
    isUnlocked: (s) => s.xp >= 500,
    progress: (s) => Math.min(s.xp / 500, 1),
  },
];

export function getBadgeProgress(stats: UserStats) {
  return BADGES.map((badge) => ({
    ...badge,
    unlocked: badge.isUnlocked(stats),
    progressValue: badge.progress(stats),
  }));
}
