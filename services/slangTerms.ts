import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import type { NewSlangTerm } from '@/types/slangTerm';

export async function addSlangTerm(data: NewSlangTerm) {
  const docRef = await addDoc(collection(db, 'slang_terms'), {
    ...data,
    createdAt: serverTimestamp(),
  });

  // You clearly already know a word if you're the one submitting it —
  // add it straight to your own learnedTerms list. setDoc with merge:true
  // creates the user's Firestore profile doc if it doesn't exist yet,
  // or safely merges into it if it already does.
  await setDoc(doc(db, 'users', data.submittedBy), {
    learnedTerms: arrayUnion(docRef.id),
  }, { merge: true });

  return docRef.id;
}
