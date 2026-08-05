import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import type { NewSlangTerm } from '@/types/slangTerm';

export async function addSlangTerm(data: NewSlangTerm) {
  // Firestore throws if any field is `undefined` — so optional fields are
  // only added to the payload when they actually have a value, rather than
  // always being present (possibly as undefined).
  const payload: Record<string, any> = {
    term: data.term,
    meaning: data.meaning,
    language: data.language,
    submittedBy: data.submittedBy,
    submittedByName: data.submittedByName,
    createdAt: serverTimestamp(),
  };
  if (data.examples && data.examples.length > 0) {
    payload.examples = data.examples;
  }
  if (data.region) {
    payload.region = data.region;
  }

  const docRef = await addDoc(collection(db, 'slang_terms'), payload);

  await setDoc(doc(db, 'users', data.submittedBy), {
    learnedTerms: arrayUnion(docRef.id),
  }, { merge: true });

  return docRef.id;
}
