import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SlangTerm } from '@/types/slangTerm';

export async function saveTermForUser(uid: string, termId: string) {
  await setDoc(doc(db, 'users', uid), {
    savedTerms: arrayUnion(termId),
  }, { merge: true });
}

export async function getSavedTerms(uid: string): Promise<SlangTerm[]> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  const savedIds: string[] = userSnap.exists() ? (userSnap.data().savedTerms ?? []) : [];

  // Firestore has no simple "get many docs by ID" call, so this fires one
  // getDoc per saved term, all in parallel via Promise.all rather than
  // one-by-one — fine at this scale, and avoids Firestore's 30-item cap
  // on the alternative ('in' queries), which would silently break for
  // anyone with a bigger personal dictionary down the line.
  const termDocs = await Promise.all(
    savedIds.map((id) => getDoc(doc(db, 'slang_terms', id)))
  );

  return termDocs
    .filter((snap) => snap.exists())
    .map((snap) => ({ id: snap.id, ...snap.data() } as SlangTerm));
}
