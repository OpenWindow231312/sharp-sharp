export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number; // 0 to 1, for the progress bar
  isMaxLevel: boolean;
};

const LEVELS = [
  { title: "Newbie", threshold: 0 },
  { title: "Fresh", threshold: 50 },
  { title: "Local Legend", threshold: 150 },
  { title: "Sharp", threshold: 300 },
  { title: "Sharp Sharp", threshold: 500 },
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
