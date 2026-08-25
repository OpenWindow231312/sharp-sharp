import type { PatternVariant } from "@/components/ui/PatternFill";
import type { BadgeShape } from "@/components/ui/BadgeMedallion";

export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number; // 0 to 1, for the progress bar
  isMaxLevel: boolean;
};

export type LevelDefinition = {
  title: string;
  threshold: number;
  pattern: PatternVariant;
  shape: BadgeShape;
};

// The 6 levels, named after the badges they absorbed (badges no longer
// exist as a separate unlockable system — see constants/badges.ts). Pattern
// and shape are copied from the matching badge by name, so the medallion
// each level shows on the Levels list is identical to the old badge art.
export const LEVELS: LevelDefinition[] = [
  { title: "Eish!", threshold: 0, pattern: "diamond", shape: "circle" },
  { title: "Ubuntu", threshold: 50, pattern: "diamond", shape: "hexagon" },
  { title: "Lekker", threshold: 150, pattern: "beadscatter", shape: "circle" },
  { title: "Ayoba", threshold: 300, pattern: "beadscatter", shape: "hexagon" },
  { title: "Local Legend", threshold: 400, pattern: "triangle", shape: "shield" },
  { title: "Sharp Sharp", threshold: 500, pattern: "chevron", shape: "burst" },
];

export function getLevelInfo(xp: number): LevelInfo {
  let levelIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) levelIndex = i;
  }
  const current = LEVELS[levelIndex];
  const next = LEVELS[levelIndex + 1];
  const xpIntoLevel = xp - current.threshold;
  const xpForNextLevel = next
    ? next.threshold - current.threshold
    : xpIntoLevel;

  return {
    level: levelIndex + 1,
    title: current.title,
    xp,
    xpIntoLevel,
    xpForNextLevel,
    progress: next ? xpIntoLevel / xpForNextLevel : 1,
    isMaxLevel: !next,
  };
}
