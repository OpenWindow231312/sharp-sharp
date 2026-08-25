import { doc, setDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SlangTerm } from '@/types/slangTerm';

export async function saveTermForUser(uid: string, termId: string) {
  await setDoc(doc(db, 'users', uid), {
    savedTerms: arrayUnion(termId),
  }, { merge: true });
}

export async function removeSavedTerm(uid: string, termId: string) {
  await setDoc(doc(db, 'users', uid), {
    savedTerms: arrayRemove(termId),
  }, { merge: true });
}

// Marks a term as learned — called when the user actually studies it in
// Learn/Study mode (which pulls its deck from savedTerms), not when they
// merely save or submit it. Distinct from savedTerms: a term can be saved
// without being learned yet, but not learned without first being saved.
export async function markTermLearned(uid: string, termId: string) {
  await setDoc(doc(db, 'users', uid), {
    learnedTerms: arrayUnion(termId),
  }, { merge: true });
}

export async function getSavedTerms(uid: string): Promise<SlangTerm[]> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  const savedIds: string[] = userSnap.exists() ? (userSnap.data().savedTerms ?? []) : [];

  const termDocs = await Promise.all(
    savedIds.map((id) => getDoc(doc(db, 'slang_terms', id)))
  );

  return termDocs
    .filter((snap) => snap.exists())
    .map((snap) => ({ id: snap.id, ...snap.data() } as SlangTerm));
}
