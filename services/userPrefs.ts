import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// The languages a user picked in onboarding (and can change on Profile).
// Stored on users/{uid} alongside xp and savedTerms so the Feed can filter
// by it. An empty list means "show me everything".
export async function setUserLanguages(uid: string, languages: string[]) {
  await setDoc(doc(db, "users", uid), { languages }, { merge: true });
}

export function matchesLanguages(
  termLanguage: string | undefined,
  languages: string[],
): boolean {
  if (languages.length === 0) return true;
  const needle = (termLanguage ?? "").trim().toLowerCase();
  return languages.some((lang) => lang.trim().toLowerCase() === needle);
}
