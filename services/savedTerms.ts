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
