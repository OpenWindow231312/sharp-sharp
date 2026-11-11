// One place to decide what letter goes in an avatar circle, so the Feed and
// Profile can't disagree (the Feed used to fall back to the email address
// while Profile used the display name).
export function getInitial(
  ...candidates: (string | null | undefined)[]
): string {
  for (const candidate of candidates) {
    const trimmed = (candidate ?? "").trim();
    if (trimmed) return trimmed[0].toUpperCase();
  }
  return "?";
}
